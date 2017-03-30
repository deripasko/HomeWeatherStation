
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>

#include <DHT.h>
#include <SFE_BMP180.h>
#include <SparkFunHTU21D.h>
#include <SparkFunBME280.h>
#include <BH1750.h>

extern "C"
{
    #include "user_interface.h"
}

#include "JsonConfig.h"
#include "Common.h"
#include "WebCommon.h"

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Server init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ESP8266WebServer WebServer(80);
const int maxConnectAttempts = 20;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sensors init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#define DHTPIN 12
#define DHTTYPE DHT22
DHT dht22(DHTPIN, DHTTYPE);
SensorData data1;

SFE_BMP180 bmp180;
#define ALTITUDE 20 //meters
bool bmp180initialized = false;
SensorData data2;

HTU21D sht21;
SensorData data3;

BME280 bme280;
SensorData data4;

BH1750 lightMeter;
uint16_t lightness;
String lightnessStr;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle stuff
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JsonConfig config;

unsigned long previousMillis = 0;
bool isRebooting = false;
int currentSensorCycle = 0;
int currentRebootCycle = 0;
const int ONE_SECOND = 1000;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reboot routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void handleTimerWhileRebooting()
{
    int periods = atoi(config.reboot_delay);
    if (currentRebootCycle == periods)
    {
        ESP.restart();
        return;
    }

    Serial.printf("Reboot ESP in %d sec.\r\n", (periods - currentRebootCycle));
}

void rebootESP()
{
    handleTimerWhileRebooting();

    //ignore all messages to display while rebooting
    isRebooting = true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Web server stuff
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void webStyles()
{
    Serial.println("\r\nServer: request STYLES");

    String stylesText = String("") + FPSTR(styles) + FPSTR(stylesBootstrap) + FPSTR(stylesBootstrapAlerts);
    WebServer.send(200, "text/css", stylesText);

    Serial.println("Server: request STYLES sent");
}

void handleNotFound()
{
    Serial.println("\r\nServer: not found");

    String data =
        renderTitle(config.module_name, "Page not found") + FPSTR(stylesInclude) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config.reboot_delay) +
        renderAlert("danger", String("Page <strong>") + WebServer.uri() + "</strong> not found.") +
        FPSTR(bodyEnd);

    WebServer.send(404, "text/html", data);
}

void webReboot()
{
    Serial.println("\r\nServer: request REBOOT");

    String data =
        renderTitle(config.module_name, "Reboot") + FPSTR(stylesInclude) +
        FPSTR(rebootScripts) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config.reboot_delay) +
        renderAlert("info", String("<strong id='info'>Module will reboot in ") + config.reboot_delay + " second(s).</strong>") +
        FPSTR(bodyEnd);

    WebServer.send(200, "text/html", data);

    Serial.println("Server: request REBOOT sent");

    rebootESP();
}

void webSetup()
{
    Serial.println("\r\nServer: request SETUP");

    bool config_changed = false;
    String payload = WebServer.arg("module_id");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.module_id, sizeof(config.module_id));
        config_changed = true;
    }
    payload = WebServer.arg("module_name");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.module_name, sizeof(config.module_name));
        config_changed = true;
    }
    payload = WebServer.arg("sta_ssid");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sta_ssid, sizeof(config.sta_ssid));
        config_changed = true;
    }
    payload = WebServer.arg("sta_pwd");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sta_pwd, sizeof(config.sta_pwd));
        config_changed = true;
    }
    payload = WebServer.arg("add_data_url");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.add_data_url, sizeof(config.add_data_url));
        config_changed = true;
    }
    payload = WebServer.arg("validation_code");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.validation_code, sizeof(config.validation_code));
        config_changed = true;
    }

    payload = WebServer.arg("static_ip_mode");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.static_ip_mode, sizeof(config.static_ip_mode));
        config_changed = true;
    }
    payload = WebServer.arg("static_ip");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.static_ip, sizeof(config.static_ip));
        config_changed = true;
    }
    payload = WebServer.arg("static_gateway");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.static_gateway, sizeof(config.static_gateway));
        config_changed = true;
    }
    payload = WebServer.arg("static_subnet");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.static_subnet, sizeof(config.static_subnet));
        config_changed = true;
    }

    String data = 
        renderTitle(config.module_name, "Setup") + FPSTR(stylesInclude) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config.reboot_delay) +
        "<h2>Module Setup</h2>" +
        "<div class='container'>" +
        renderParameterRow("Module ID", "module_id", config.module_id, 4) + 
        renderParameterRow("Module Name", "module_name", config.module_name, 32) + 
        "<hr/>" +
        renderParameterRow("SSID", "sta_ssid", config.sta_ssid, 32) + 
        renderParameterRow("Password", "sta_pwd", config.sta_pwd, 32, false, true) + 
        "<hr/>" +
        renderParameterRow("Static IP Mode", "static_ip_mode", config.static_ip_mode, 1) + 
        renderParameterRow("Static IP", "static_ip", config.static_ip, 15) + 
        renderParameterRow("Gateway", "static_gateway", config.static_gateway, 15) + 
        renderParameterRow("Subnet", "static_subnet", config.static_subnet, 15) + 
        "<hr/>" +
        renderParameterRow("Add Data URL", "add_data_url", config.add_data_url, 200) + 
        renderParameterRow("Validation Code", "validation_code", config.validation_code, 16) + 
        "<hr/>" +
        "<a class='btn btn-default marginTop0' role='button' onclick='saveFormData(\"/setup\");'>Save</a>" +
        "</div>" +
        FPSTR(bodyEnd);

    WebServer.send(200, "text/html", data);

    if (config_changed)
    {
        config.saveConfig();
    }

    Serial.println("Server: request SETUP sent");
}

void webRoot()
{
    Serial.println("\r\nServer: request ROOT");

    String data = 
        renderTitle(config.module_name, "Home") + FPSTR(stylesInclude) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config.reboot_delay) +
        String(F("<h2>Welcome to ")) + config.module_name + String(F("</h2>")) +
        String(F("<div class='container'>")) +
        renderParameterRow("Module ID", "", config.module_id, true) + 
        renderParameterRow("Module Name", "", config.module_name, true) + 
        renderParameterRow("Module IP", "", getIpString(WiFi.localIP()), true) + 
        renderParameterRow("Module MAC", "", getMacString(), true) + 
        String(F("</div>")) +
        FPSTR(bodyEnd);

    WebServer.send(200, "text/html", data);    
    Serial.println("Server: request ROOT sent");
}

void webSensors()
{
    Serial.println("\r\nServer: request SENSORS");

    bool config_changed = false;
    String payload = WebServer.arg("sensor_bmp180_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_bmp180_on, sizeof(config.sensor_bmp180_on));
        config_changed = true;
    }
    payload = WebServer.arg("sensor_dht22_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_dht22_on, sizeof(config.sensor_dht22_on));
        config_changed = true;
    }
    payload = WebServer.arg("sensor_sht21_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_sht21_on, sizeof(config.sensor_sht21_on));
        config_changed = true;
    }
    payload = WebServer.arg("sensor_bh1750_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_bh1750_on, sizeof(config.sensor_bh1750_on));
        config_changed = true;
    }
    payload = WebServer.arg("sensor_co2_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_co2_on, sizeof(config.sensor_co2_on));
        config_changed = true;
    }
    payload = WebServer.arg("sensor_bme280_on");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.sensor_bme280_on, sizeof(config.sensor_bme280_on));
        config_changed = true;
    }

    payload = WebServer.arg("reboot_delay");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.reboot_delay, sizeof(config.reboot_delay));
        config_changed = true;
    }
    payload = WebServer.arg("get_data_delay");
    if (payload.length() > 0)
    {
        payload.toCharArray(config.get_data_delay, sizeof(config.get_data_delay));
        config_changed = true;
    }

    String data = 
        renderTitle(config.module_name, "Setup") + FPSTR(stylesInclude) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config.reboot_delay) +
        "<h2>Module Sensors</h2>" +
        "<div class='container'>" +
        renderParameterRow("BMP180 On", "sensor_bmp180_on", config.sensor_bmp180_on, 1) + 
        renderParameterRow("DHT22 On", "sensor_dht22_on", config.sensor_dht22_on, 1) + 
        renderParameterRow("SHT21 On", "sensor_sht21_on", config.sensor_sht21_on, 1) + 
        renderParameterRow("BH1750 On", "sensor_bh1750_on", config.sensor_bh1750_on, 1) + 
        renderParameterRow("CO2 Sensor On", "sensor_co2_on", config.sensor_co2_on, 1) + 
        renderParameterRow("BME280 On", "sensor_bme280_on", config.sensor_bme280_on, 1) + 
        "<hr/>" +
        renderParameterRow("Reboot Delay, sec", "reboot_delay", config.reboot_delay, 3) + 
        renderParameterRow("Sensors Delay, sec", "get_data_delay", config.get_data_delay, 3) + 
        "<hr/>" +
        "<a class='btn btn-default marginTop0' role='button' onclick='saveFormData(\"/sensors\");'>Save</a>" +
        "</div>" +
        FPSTR(bodyEnd);

    WebServer.send(200, "text/html", data);

    if (config_changed)
    {
        config.saveConfig();
    }

    Serial.println("Server: request SENSORS sent");
}

void initWebServer()
{
    Serial.println("Server: starting");
    WebServer.on("/", webRoot);
    WebServer.on("/setup", webSetup);
    WebServer.on("/sensors", webSensors);
    WebServer.on("/reboot", webReboot);
    WebServer.on("/styles.css", webStyles);
    WebServer.onNotFound(handleNotFound);
    WebServer.begin();
    Serial.println("Server: started");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WiFi routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void handleWiFiEvent(WiFiEvent_t event)
{
    switch (event)
    {
        case WIFI_EVENT_STAMODE_CONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_CONNECTED");
            break;
        case WIFI_EVENT_STAMODE_DISCONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_DISCONNECTED");
            break;
        case WIFI_EVENT_STAMODE_AUTHMODE_CHANGE:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_AUTHMODE_CHANGE");
            break;
        case WIFI_EVENT_STAMODE_GOT_IP:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_GOT_IP");
            Serial.print("Wifi: connected, IP = ");
            Serial.print(WiFi.localIP());
            Serial.print(", MAC = ");
            Serial.print(getMacString());
            Serial.println();
            break;
        case WIFI_EVENT_STAMODE_DHCP_TIMEOUT:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_DHCP_TIMEOUT");
            break;
        case WIFI_EVENT_SOFTAPMODE_STACONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_SOFTAPMODE_STACONNECTED");
            break;
        case WIFI_EVENT_SOFTAPMODE_STADISCONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_SOFTAPMODE_STADISCONNECTED");
            break;
        case WIFI_EVENT_SOFTAPMODE_PROBEREQRECVED:
            break;
        case WIFI_EVENT_MAX:
            Serial.println("Wifi event: WIFI_EVENT_MAX");
            break;
    }
}

int connectWiFi()
{
    Serial.println("Wifi: connecting");

    int connectAttempts = 0;

    while (connectAttempts < maxConnectAttempts)
    {
        analogWrite(4, 1024);
        delay(50);
        analogWrite(4, 0);

        Serial.printf("Wifi: connecting, attempt %d\r\n", connectAttempts);
        if (WiFi.status() == WL_CONNECTED)
        {
            Serial.println("Wifi: connected");
            return 1;
        }

        delay(450);
        connectAttempts++;

        yield();
    }

    Serial.println("Wifi: timeout");
    return 0;
}

void initWiFi()
{
    Serial.println("Wifi: starting");

    delay(1000);
    WiFi.mode(WIFI_AP_STA);
    WiFi.onEvent(handleWiFiEvent);

    if (atoi(config.static_ip_mode) == 1)
    {
        Serial.println("Wifi: use static IP");
        IPAddress staticIP = stringToIp(config.static_ip);
        Serial.print("Wifi: preferred IP: ");
        Serial.println(staticIP);
        IPAddress staticGateway = stringToIp(config.static_gateway);
        Serial.print("Wifi: preferred gateway: ");
        Serial.println(staticGateway);
        IPAddress staticSubnet = stringToIp(config.static_subnet);
        Serial.print("Wifi: preferred subnet: ");
        Serial.println(staticSubnet);
        WiFi.config(staticIP, staticGateway, staticSubnet);
    }
    else
    {
        Serial.println("Wifi: using DHCP");
    }

    WiFi.begin(config.sta_ssid, config.sta_pwd);

    Serial.println(String("Wifi: connect to '") + config.sta_ssid + "' with password '" + config.sta_pwd + "'");

    connectWiFi();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println(String("Wifi: connected, creating AP '") + config.module_name + "'");
        WiFi.softAP(config.module_name, "temppassword");
        Serial.print("Wifi: connected, IP = ");
        Serial.print(WiFi.localIP());
        Serial.println();
    }
    else
    {
        Serial.println(String("Wifi: not connected, creating AP '") + config.module_name + "'");
        WiFi.mode(WIFI_AP);
        WiFi.softAP(config.module_name, "temppassword");
        Serial.print("Wifi: created AP with IP = ");
        Serial.print(WiFi.softAPIP());
        Serial.println();
    }

    Serial.println("Wifi: started\r\n");

    initWebServer();

    if (!MDNS.begin(config.module_name))
    {
        while (1)
        {
            delay(1000);
            yield();
        }
    }
    MDNS.addService("http", "tcp", 80);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup routine
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void setup()
{
    Serial.begin(115200);

    isRebooting = false;
    currentSensorCycle = 0;
    currentRebootCycle = 0;

    Serial.println("\r\nStarting module...");

    if (!SPIFFS.begin())
    {
        Serial.println("Config: failed to mount file system");
    }
    else
    {
        if (!config.loadConfig())
        {
            Serial.println("Config: failed to load");
        }
        else
        {
            Serial.println("Config: loaded");
        }

        config.printConfig();
    }

    initWiFi();
    initSensors();

    Serial.println("\r\nStarting complete.");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Retrieve sensors data routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void initBme280()
{
    //For I2C, enable the following and disable the SPI section
    bme280.settings.commInterface = I2C_MODE;
    bme280.settings.I2CAddress = 0x76;
    
    //***Operation settings*****************************//
    
    //renMode can be:
    //  0, Sleep mode
    //  1 or 2, Forced mode
    //  3, Normal mode
    bme280.settings.runMode = 3; //Normal mode
    
    //tStandby can be:
    //  0, 0.5ms
    //  1, 62.5ms
    //  2, 125ms
    //  3, 250ms
    //  4, 500ms
    //  5, 1000ms
    //  6, 10ms
    //  7, 20ms
    bme280.settings.tStandby = 0;
    
    //filter can be off or number of FIR coefficients to use:
    //  0, filter off
    //  1, coefficients = 2
    //  2, coefficients = 4
    //  3, coefficients = 8
    //  4, coefficients = 16
    bme280.settings.filter = 0;
    
    //tempOverSample can be:
    //  0, skipped
    //  1 through 5, oversampling *1, *2, *4, *8, *16 respectively
    bme280.settings.tempOverSample = 1;
  
    //pressOverSample can be:
    //  0, skipped
    //  1 through 5, oversampling *1, *2, *4, *8, *16 respectively
    bme280.settings.pressOverSample = 1;
    
    //humidOverSample can be:
    //  0, skipped
    //  1 through 5, oversampling *1, *2, *4, *8, *16 respectively
    bme280.settings.humidOverSample = 1;
  
    //Calling .begin() causes the settings to be loaded
    delay(10);  //Make sure sensor had enough time to turn on. BME280 requires 2ms to start up.

    bme280.begin();
}

void initSensors()
{
    if (atoi(config.sensor_dht22_on) == 1)
    {
        dht22.begin();
    }

    if (atoi(config.sensor_bmp180_on) == 1)
    {
        if (bmp180.begin())
        {
            bmp180initialized = true;
        }
    }

    if (atoi(config.sensor_sht21_on) == 1)
    {
        sht21.begin();
    }

    if (atoi(config.sensor_bme280_on) == 1)
    {
        initBme280();
    }

    if (atoi(config.sensor_bh1750_on) == 1)
    {
        lightMeter.begin();
    }
}

SensorData getDht22Data()
{
    float h = dht22.readHumidity();
    float t = dht22.readTemperature();
    SensorData data;
    data.humidity = h;
    data.temp = t;
    data.pressure = 0;
    return data;
}

SensorData getBmp180Data()
{
    char status;
    double T, P, p0, a;

    // If you want to measure altitude, and not pressure, you will instead need
    // to provide a known baseline pressure. This is shown at the end of the sketch.
    // You must first get a temperature measurement to perform a pressure reading.  
    // Start a temperature measurement:
    // If request is successful, the number of ms to wait is returned.
    // If request is unsuccessful, 0 is returned.
    status = bmp180.startTemperature();

    if (status != 0)
    {
        // Wait for the measurement to complete:
        delay(status);

        // Retrieve the completed temperature measurement:
        // Note that the measurement is stored in the variable T.
        // Function returns 1 if successful, 0 if failure.
        status = bmp180.getTemperature(T);

        if (status != 0)
        {
            // Start a pressure measurement:
            // The parameter is the oversampling setting, from 0 to 3 (highest res, longest wait).
            // If request is successful, the number of ms to wait is returned.
            // If request is unsuccessful, 0 is returned.
            status = bmp180.startPressure(3);

            if (status != 0)
            {
                // Wait for the measurement to complete:
                delay(status);

                // Retrieve the completed pressure measurement:
                // Note that the measurement is stored in the variable P.
                // Note also that the function requires the previous temperature measurement (T).
                // (If temperature is stable, you can do one temperature measurement for a number of pressure measurements.)
                // Function returns 1 if successful, 0 if failure.
                status = bmp180.getPressure(P, T);

                if (status != 0)
                {
                    // The pressure sensor returns abolute pressure, which varies with altitude.
                    // To remove the effects of altitude, use the sealevel function and your current altitude.
                    // This number is commonly used in weather reports.
                    // Parameters: P = absolute pressure in mb, ALTITUDE = current altitude in m.
                    // Result: p0 = sea-level compensated pressure in mb

                    p0 = bmp180.sealevel(P, ALTITUDE);

                    // On the other hand, if you want to determine your altitude from the pressure reading,
                    // use the altitude function along with a baseline pressure (sea-level or other).
                    // Parameters: P = absolute pressure in mb, p0 = baseline pressure in mb.
                    // Result: a = altitude in m.

                    a = bmp180.altitude(P, p0);
                }
            }
        }
    }

    SensorData data;
    if (bmp180initialized)
    {
        data.temp = T;
        data.pressure = p0;
        data.humidity = 0;
    }    
    return data;
}

SensorData getSht21Data()
{
    float h = sht21.readHumidity();
    float t = sht21.readTemperature();
    SensorData data;
    data.humidity = h;
    data.temp = t;
    data.pressure = 0;
    return data;
}

SensorData getBme280Data()
{
    float t = bme280.readTempC();
    float p = bme280.readFloatPressure();
    float h = bme280.readFloatHumidity();

    SensorData data;
    data.humidity = h;
    data.temp = t;
    data.pressure = p;
    return data;
}

uint16_t getLightness()
{
    uint16_t lux = lightMeter.readLightLevel();
    return lux;
}

void requestSensorValues()
{
    if (atoi(config.sensor_dht22_on) == 1)
    {
        data1 = getDht22Data();
    }

    if (atoi(config.sensor_bmp180_on) == 1)
    {
        data2 = getBmp180Data();
    }

    if (atoi(config.sensor_sht21_on) == 1)
    {
        data3 = getSht21Data();
    }

    if (atoi(config.sensor_bme280_on) == 1)
    {
        data4 = getBme280Data();
    }

    if (atoi(config.sensor_bh1750_on) == 1)
    {
        lightness = getLightness();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Send data routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

float getTempForJson(float value)
{
    return (isnan(value) || value > 70) ? 0 : value;
}

float getHumidityForJson(float value)
{
    return (isnan(value) || value > 100) ? 0 : value;
}

float getIlluminationForJson(float value)
{
    return (isnan(value) || value > 50000) ? 0 : value;
}

float getPressureForJson(float value)
{
    return (isnan(value) || value > 1000) ? 0 : value;
}

void renderSensorValues()
{
    if (atoi(config.sensor_dht22_on) == 1)
    {
        data1.tempStr = floatToString(data1.temp, VALUE_TEMP);
        data1.humidityStr = floatToString(data1.humidity, VALUE_HUMIDITY);
        Serial.println(String("Temp 1    : " + data1.tempStr));
        Serial.println(String("RH 1      : " + data1.humidityStr));
    }

    if (atoi(config.sensor_bmp180_on) == 1)
    {
        data2.tempStr = floatToString(data2.temp, VALUE_TEMP);
        data2.humidityStr = floatToString(data2.humidity, VALUE_HUMIDITY);
        data2.pressureStr = floatToString(data2.pressure * 0.0295333727 * 25.4, VALUE_PRESSURE, 3, 0);
        Serial.println(String("Temp 2    : " + data2.tempStr));
        Serial.println(String("RH 2      : " + data2.humidityStr));
        Serial.println(String("Pressure 2: " + data2.pressureStr));
    }

    if (atoi(config.sensor_sht21_on) == 1)
    {
        data3.tempStr = floatToString(data3.temp, VALUE_TEMP);
        data3.humidityStr = floatToString(data3.humidity, VALUE_HUMIDITY);
        data3.pressureStr = floatToString(data3.pressure * 0.0295333727 * 25.4, VALUE_PRESSURE, 3, 0);
        Serial.println(String("Temp 3    : " + data3.tempStr));
        Serial.println(String("RH 3      : " + data3.humidityStr));
        Serial.println(String("Pressure 3: " + data3.pressureStr));
    }

    if (atoi(config.sensor_bme280_on) == 1)
    {
        data4.tempStr = floatToString(data4.temp, VALUE_TEMP);
        data4.humidityStr = floatToString(data4.humidity, VALUE_HUMIDITY);
        data4.pressureStr = floatToString(data4.pressure * 0.0295333727 * 25.4, VALUE_PRESSURE, 3, 0);
        Serial.println(String("Temp 4    : " + data4.tempStr));
        Serial.println(String("RH 4      : " + data4.humidityStr));
        Serial.println(String("Pressure 4: " + data4.pressureStr));
    }

    if (atoi(config.sensor_bh1750_on) == 1)
    {
        lightnessStr = floatToString(lightness, VALUE_ILLUMINATION, 5, 0);
        Serial.println(String("Light     : " + lightnessStr));
    }
}

String getSensorsDataJson()
{
    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();

    json["moduleid"] = atoi(config.module_id);
    json["modulename"] = config.module_name;
    json["code"] = config.validation_code;

    if (atoi(config.sensor_dht22_on) == 1)
    {
        json["temperature1"] = getTempForJson(data1.temp);
        json["humidity1"] = getHumidityForJson(data1.humidity);
    }

    if (atoi(config.sensor_bmp180_on) == 1)
    {
        json["temperature2"] = getTempForJson(data2.temp);
        json["humidity2"] = getHumidityForJson(data2.humidity);
        json["pressure2"] = getPressureForJson(data2.pressure);
    }

    if (atoi(config.sensor_sht21_on) == 1)
    {
        json["temperature3"] = getTempForJson(data3.temp);
        json["humidity3"] = getHumidityForJson(data3.humidity);
        json["pressure3"] = getPressureForJson(data3.pressure);
    }

    if (atoi(config.sensor_bme280_on) == 1)
    {
        json["temperature4"] = getTempForJson(data4.temp);
        json["humidity4"] = getHumidityForJson(data4.humidity);
        json["pressure4"] = getPressureForJson(data4.pressure);
    }

    if (atoi(config.sensor_bh1750_on) == 1)
    {
        json["illumination"] = getIlluminationForJson(lightness);
    }

    json["ip"] = getIpString(WiFi.localIP());
    json["mac"] = getMacString();
    json["delay"] = config.get_data_delay;

    char buffer[2048];
    json.printTo(buffer, sizeof(buffer));

    return String(buffer);
}

void sendSensorsData()
{
    Serial.println("\r\nHTTPClient: starting");

    String payload = getSensorsDataJson();
    HTTPClient http;

    Serial.println(String("HTTPClient: request URL ") + config.add_data_url + " with payload " + payload);
    http.begin(config.add_data_url);
    Serial.println("HTTPClient: URL requested");

    int httpCode = http.POST(payload);

    if (httpCode > 0)
    {
        if (httpCode == HTTP_CODE_OK)
        {
            String payload = http.getString();
            Serial.println("HTTPClient: " + payload);
            Serial.printf("HTTPClient: server OK %d\r\n", httpCode);
        }
        else
        {
            Serial.printf("HTTPClient: server ERROR %d\r\n", httpCode);
        }
    }
    else
    {
        Serial.println("HTTPClient: server OFF");
    }

    http.end();

    Serial.println("HTTPClient: ended");

    yield();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loop routine
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void loop()
{
    WebServer.handleClient();

    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= ONE_SECOND)
    {
        currentSensorCycle++;
        previousMillis = currentMillis;

        if (isRebooting)
        {
            currentRebootCycle++;
            handleTimerWhileRebooting();
        }
        else
        {
            if (currentSensorCycle % atoi(config.get_data_delay) == 0)
            {
                Serial.println("\r\nGetting sensors data...");
                requestSensorValues();
                renderSensorValues();
                if (WiFi.status() == WL_CONNECTED)
                {
                    sendSensorsData();
                }
            }
        }
    }
}
