#include "JsonConfig.h"

bool JsonConfig::printConfig()
{
    Serial.println("\r\nConfig: printing");

    Serial.print(F("module_id     : "));   Serial.println(module_id);
    Serial.print(F("module_name   : "));   Serial.println(module_name);
    Serial.print(F("sta_ssid      : "));   Serial.println(sta_ssid);
    Serial.print(F("sta_pwd       : "));   Serial.println(sta_pwd);

    Serial.print(F("static_ip_mode: "));   Serial.println(static_ip_mode);
    Serial.print(F("static_ip     : "));   Serial.println(static_ip);
    Serial.print(F("static_gateway: "));   Serial.println(static_gateway);
    Serial.print(F("static_subnet : "));   Serial.println(static_subnet);

    Serial.print(F("get_data_delay: "));   Serial.println(get_data_delay);
    Serial.print(F("reboot_delay  : "));   Serial.println(reboot_delay);

    Serial.print(F("add_data_url      : "));   Serial.println(add_data_url);
    Serial.print(F("validation_code   : "));   Serial.println(validation_code);

    Serial.print(F("sensor_bmp180_on  : "));   Serial.println(sensor_bmp180_on);
    Serial.print(F("sensor_dht22_on   : "));   Serial.println(sensor_dht22_on);
    Serial.print(F("sensor_sht21_on   : "));   Serial.println(sensor_sht21_on);
    Serial.print(F("sensor_bh1750_on  : "));   Serial.println(sensor_bh1750_on);
    Serial.print(F("sensor_co2_on     : "));   Serial.println(sensor_co2_on);
    Serial.print(F("sensor_bme280_on  : "));   Serial.println(sensor_bme280_on);

    Serial.print(F("rtc_on            : "));   Serial.println(rtc_on);
    Serial.print(F("use_server_time   : "));   Serial.println(use_server_time);
    Serial.print(F("use_ntp_server    : "));   Serial.println(use_ntp_server);
    Serial.print(F("ntp_server        : "));   Serial.println(ntp_server);
    Serial.print(F("time_zone_offset  : "));   Serial.println(time_zone_offset);

    Serial.println("\r\nConfig: printed");

    return true;
}

bool JsonConfig::loadConfig()
{
    Serial.println("\r\nConfig: loading");

    File configFile = SPIFFS.open("/config.json", "r");
    if (!configFile)
    {
        Serial.println("Config: failed to open config file for reading");
        return false;
    }

    size_t size = configFile.size();
    if (size > 2048)
    {
        Serial.println("Config: file size is too large");
        SPIFFS.remove("/config.json");
        saveConfig();
        return false;
    }

    // Allocate a buffer to store contents of the file.
    std::unique_ptr<char[]> buf(new char[size]);

    // We don't use String here because ArduinoJson library requires the input
    // buffer to be mutable. If you don't use ArduinoJson, you may as well
    // use configFile.readString instead.
    configFile.readBytes(buf.get(), size);

    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.parseObject(buf.get());

    if (!json.success())
    {
        Serial.println("Failed to parse config file");
        SPIFFS.remove("/config.json");
        saveConfig();
        return false;
    }

    if (json.containsKey("module_id")) { const char* module_id_char = json["module_id"]; sprintf_P(module_id, ("%s"), module_id_char); }
    if (json.containsKey("module_name")) { const char* module_name_char = json["module_name"]; sprintf_P(module_name, ("%s"), module_name_char); }
    if (json.containsKey("sta_ssid")) { const char* sta_ssid_char = json["sta_ssid"]; sprintf_P(sta_ssid, ("%s"), sta_ssid_char); }
    if (json.containsKey("sta_pwd")) { const char* sta_pwd_char = json["sta_pwd"]; sprintf_P(sta_pwd, ("%s"), sta_pwd_char); }

    if (json.containsKey("static_ip_mode")) { const char* static_ip_mode_char = json["static_ip_mode"]; sprintf_P(static_ip_mode, ("%s"), static_ip_mode_char); }
    if (json.containsKey("static_ip")) { const char* static_ip_char = json["static_ip"]; sprintf_P(static_ip, ("%s"), static_ip_char); }
    if (json.containsKey("static_gateway")) { const char* static_gateway_char = json["static_gateway"]; sprintf_P(static_gateway, ("%s"), static_gateway_char); }
    if (json.containsKey("static_subnet")) { const char* static_subnet_char = json["static_subnet"]; sprintf_P(static_subnet, ("%s"), static_subnet_char); }

    if (json.containsKey("get_data_delay")) { const char* get_data_delay_char = json["get_data_delay"]; sprintf_P(get_data_delay, ("%s"), get_data_delay_char); }
    if (json.containsKey("reboot_delay")) { const char* reboot_delay_char = json["reboot_delay"]; sprintf_P(reboot_delay, ("%s"), reboot_delay_char); }

    if (json.containsKey("add_data_url")) { const char* add_data_url_char = json["add_data_url"]; sprintf_P(add_data_url, ("%s"), add_data_url_char); }
    if (json.containsKey("validation_code")) { const char* validation_code_char = json["validation_code"]; sprintf_P(validation_code, ("%s"), validation_code_char); }

    if (json.containsKey("sensor_bmp180_on")) { const char* sensor_bmp180_on_char = json["sensor_bmp180_on"]; sprintf_P(sensor_bmp180_on, ("%s"), sensor_bmp180_on_char); }
    if (json.containsKey("sensor_dht22_on")) { const char* sensor_dht22_on_char = json["sensor_dht22_on"]; sprintf_P(sensor_dht22_on, ("%s"), sensor_dht22_on_char); }
    if (json.containsKey("sensor_sht21_on")) { const char* sensor_sht21_on_char = json["sensor_sht21_on"]; sprintf_P(sensor_sht21_on, ("%s"), sensor_sht21_on_char); }
    if (json.containsKey("sensor_bh1750_on")) { const char* sensor_bh1750_on_char = json["sensor_bh1750_on"]; sprintf_P(sensor_bh1750_on, ("%s"), sensor_bh1750_on_char); }
    if (json.containsKey("sensor_co2_on")) { const char* sensor_co2_on_char = json["sensor_co2_on"]; sprintf_P(sensor_co2_on, ("%s"), sensor_co2_on_char); }
    if (json.containsKey("sensor_bme280_on")) { const char* sensor_bme280_on_char = json["sensor_bme280_on"]; sprintf_P(sensor_bme280_on, ("%s"), sensor_bme280_on_char); }

    if (json.containsKey("rtc_on")) { const char* rtc_on_char = json["rtc_on"]; sprintf_P(rtc_on, ("%s"), rtc_on_char); }
    if (json.containsKey("use_server_time")) { const char* use_server_time_char = json["use_server_time"]; sprintf_P(use_server_time, ("%s"), use_server_time_char); }
    if (json.containsKey("use_ntp_server")) { const char* use_ntp_server_char = json["use_ntp_server"]; sprintf_P(use_ntp_server, ("%s"), use_ntp_server_char); }
    if (json.containsKey("ntp_server")) { const char* ntp_server_char = json["ntp_server"]; sprintf_P(ntp_server, ("%s"), ntp_server_char); }
    if (json.containsKey("time_zone_offset")) { const char* time_zone_offset_char = json["time_zone_offset"]; sprintf_P(time_zone_offset, ("%s"), time_zone_offset_char); }

    configFile.close();

    Serial.println("Config: loaded");

    return true;
}

bool JsonConfig::saveConfig()
{
    Serial.println("\r\nConfig: saving");

    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile)
    {
        Serial.println("Config: failed to open config file for writing");
        return false;
    }

    json["module_id"] = module_id;
    json["module_name"] = module_name;
    json["sta_ssid"] = sta_ssid;
    json["sta_pwd"] = sta_pwd;

    json["static_ip_mode"] = static_ip_mode;
    json["static_ip"] = static_ip;
    json["static_gateway"] = static_gateway;
    json["static_subnet"] = static_subnet;

    json["get_data_delay"] = get_data_delay;
    json["reboot_delay"] = reboot_delay;

    json["add_data_url"] = add_data_url;
    json["validation_code"] = validation_code;

    json["sensor_bmp180_on"] = sensor_bmp180_on;
    json["sensor_dht22_on"] = sensor_dht22_on;
    json["sensor_sht21_on"] = sensor_sht21_on;
    json["sensor_bh1750_on"] = sensor_bh1750_on;
    json["sensor_co2_on"] = sensor_co2_on;
    json["sensor_bme280_on"] = sensor_bme280_on;

    json["rtc_on"] = rtc_on;
    json["use_server_time"] = use_server_time;
    json["use_ntp_server"] = use_ntp_server;
    json["ntp_server"] = ntp_server;
    json["time_zone_offset"] = time_zone_offset;

    json.printTo(configFile);
    configFile.close();

    Serial.println("Config: saved");

    return true;
}

