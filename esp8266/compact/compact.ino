
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>

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

void initWebServer()
{
    Serial.println("Server: starting");
    WebServer.on("/", webRoot);
    WebServer.on("/setup", webSetup);
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

    SPIFFS.format();
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

    Serial.println("\r\nStarting complete.");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Retrieve sensors data routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

void requestSensorValues()
{
    if (atoi(config.sensor_dht22_on) == 1)
    {
        data1 = getDht22Data();
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

void renderSensorValues()
{
    if (atoi(config.sensor_dht22_on) == 1)
    {
        data1.tempStr = floatToString(data1.temp, VALUE_TEMP);
        data1.humidityStr = floatToString(data1.humidity, VALUE_HUMIDITY);
        Serial.println(String("Temp 1    : " + data1.tempStr));
        Serial.println(String("RH 1      : " + data1.humidityStr));
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
