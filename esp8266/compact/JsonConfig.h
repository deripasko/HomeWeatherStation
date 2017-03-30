#ifndef JSONCONFIG_H
#define JSONCONFIG_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "FS.h"

class SensorData
{
public:
    float temp;
    String tempStr;

    float humidity;
    String humidityStr;

    float pressure;
    String pressureStr;
};

class JsonConfig
{
public:
    bool saveConfig();
    bool loadConfig();
    bool printConfig();

    // numeric value between 1 and 1024 which will identify module
    char module_id[5] = "1";
    // module name
    char module_name[32] = "Module-01";
    // wifi network SSID
    char sta_ssid[32] = "your-network-ssid";
    // wifi network password
    char sta_pwd[32] = "your-network-password";

    // 0 - using static IP mode, 1 - dynamic IP mode
    char static_ip_mode[2] = "0";
    // statis IP to set
    char static_ip[16] = "192.168.1.200";
    // gateway to use
    char static_gateway[16] = "192.168.1.1";
    // subnet mask to use
    char static_subnet[16] = "255.255.255.0";

    // delay to retrieve data from sensors in seconds, max - 999 seconds
    char get_data_delay[5] = "10";
    // delays in seconds before rebooting module, max - 999 seconds
    char reboot_delay[5] = "10";

    // if using sensor - set to 1, instead set to 0
    char sensor_bmp180_on[2] = "1";
    // if using sensor - set to 1, instead set to 0
    char sensor_dht22_on[2] = "1";
    // if using sensor - set to 1, instead set to 0
    char sensor_sht21_on[2] = "1";
    // if using sensor - set to 1, instead set to 0
    char sensor_bh1750_on[2] = "1";
    // if using sensor - set to 1, instead set to 0
    char sensor_co2_on[2] = "1";
    // if using sensor - set to 1, instead set to 0
    char sensor_bme280_on[2] = "1";

    // address to push module data
    char add_data_url[200] = "http://note4me.ru/add.php";
    // validation code used to identify user's module
    char validation_code[17] = "0000000000000000";

private:
};

#endif
