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

class WiFiData
{
public:
    String ssid;
    long rssi;
    byte encryptionType;
    bool isSet;
};

class JsonConfig
{
public:
    bool saveConfig();
    bool loadConfig();
    bool printConfig();

    char module_id[32] = "1";
    char module_name[32] = "MeteoESP1";
    char sta_ssid[32] = "Keenetic-8095";
    char sta_pwd[32] = "89168561950";

    char static_ip_mode[32] = "0";
    char static_ip[32] = "192.168.1.55";
    char static_gateway[32] = "192.168.1.1";
    char static_subnet[32] = "255.255.255.0";

    char get_data_delay[32] = "10";
    char reboot_delay[32] = "10";

    char sensor_bmp180_on[32] = "1";
    char sensor_dht22_on[32] = "1";
    char sensor_sht21_on[32] = "1";
    char sensor_bh1750_on[32] = "1";
    char sensor_co2_on[32] = "1";
    char sensor_bme280_on[32] = "1";

    char rtc_on[32] = "1";
    char use_server_time[32] = "1";
    char use_ntp_server[32] = "0";
    char ntp_server[32] = "europe.pool.ntp.org";
    char time_zone_offset[32] = "0";

    char add_data_url[32] = "http://note4me.ru/add.php";

private:
};

#endif
