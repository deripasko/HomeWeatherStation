<?php

include_once("dbconfig.php");
include_once("requester.php");

////////////////////////////////////////////////////////////////////////////////////////////

function getParam($object, $name)
{
    if (isset($object[$name]) && !empty($object[$name]))
        return $object[$name];
    return null;
}

function valueOrNull($value)
{
    if ($value == 0)
        return 'null';
    return $value;
}

function randForValue($value)
{
    return $value + mt_rand() / mt_getrandmax();
}

$id = 0;
$input = file_get_contents('php://input');

if (empty($input)) {
    $data = array(
        'error' => 'Please use JSON to add data.'
    );
    print json_encode($data);
    return;
}

////////////////////////////////////////////////////////////////////////////////////////////

$object = json_decode($input, true);

$moduleId = (int)getParam($object, "moduleid");
$moduleName = getParam($object, "modulename");
$code = getParam($object, "code");

$ip = getParam($object, "ip");
$mac = getParam($object, "mac");
$delay = (int)getParam($object, "delay");

$temperature1 = valueOrNull((float)getParam($object, "temperature1"));
$humidity1 = valueOrNull((float)getParam($object, "humidity1"));
$pressure1 = valueOrNull((float)getParam($object, "pressure1"));

$temperature2 = valueOrNull((float)getParam($object, "temperature2"));
$humidity2 = valueOrNull((float)getParam($object, "humidity2"));
$pressure2 = valueOrNull((float)getParam($object, "pressure2"));

$temperature3 = valueOrNull((float)getParam($object, "temperature3"));
$humidity3 = valueOrNull((float)getParam($object, "humidity3"));
$pressure3 = valueOrNull((float)getParam($object, "pressure3"));

$temperature4 = valueOrNull((float)getParam($object, "temperature4"));
$humidity4 = valueOrNull((float)getParam($object, "humidity4"));
$pressure4 = valueOrNull((float)getParam($object, "pressure4"));

$illumination = valueOrNull((float)getParam($object, "illumination"));
$co2level = valueOrNull((float)getParam($object, "co2"));

////////////////////////////////////////////////////////////////////////////////////////////

$weatherData = (object) [];
$weatherData->mac = $mac;
$weatherData->temperature1 = $temperature1;
$weatherData->temperature2 = $temperature2;
$weatherData->temperature3 = $temperature3;
$weatherData->temperature4 = $temperature4;
$weatherData->humidity1 = $humidity1;
$weatherData->humidity2 = $humidity2;
$weatherData->humidity3 = $humidity3;
$weatherData->humidity4 = $humidity4;
$weatherData->pressure1 = $pressure1;
$weatherData->pressure2 = $pressure2;
$weatherData->pressure3 = $pressure3;
$weatherData->pressure4 = $pressure4;
$weatherData->illumination = $illumination;
$weatherData->co2 = $co2level;

////////////////////////////////////////////////////////////////////////////////////////////

$moduleData = (object) [];
$moduleData->mac = $mac;
$moduleData->ip = $ip;
$moduleData->moduleName = $moduleName;
$moduleData->moduleId = $moduleId;
$moduleData->code = $code;
$moduleData->delay = $delay;

////////////////////////////////////////////////////////////////////////////////////////////

$requester = new Requester;
$id = $requester->addWeatherData($weatherData);
$requester->updateModuleData($moduleData);

////////////////////////////////////////////////////////////////////////////////////////////

$createFakeData = false;
if ($createFakeData) {

    $savedTemperature = $weatherData->temperature1;
    $savedHumidity = $weatherData->humidity1;

    $moduleData->ip = "192.168.1.136";
    $moduleData->mac = "18:fe:34:d6:0f:75";
    $moduleData->moduleName = "fake1";
    $moduleData->moduleId = 400;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.137";
    $moduleData->mac = "18:fe:34:d6:0f:76";
    $moduleData->moduleName = "fake2";
    $moduleData->moduleId = 401;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.138";
    $moduleData->mac = "18:fe:34:d6:0f:77";
    $moduleData->moduleName = "fake3";
    $moduleData->moduleId = 402;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.139";
    $moduleData->mac = "18:fe:34:d6:0f:78";
    $moduleData->moduleName = "fake4";
    $moduleData->moduleId = 403;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.140";
    $moduleData->mac = "18:fe:34:d6:0f:79";
    $moduleData->moduleName = "fake5";
    $moduleData->moduleId = 404;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.141";
    $moduleData->mac = "18:fe:34:d6:0f:80";
    $moduleData->moduleName = "fake6";
    $moduleData->moduleId = 405;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.142";
    $moduleData->mac = "18:fe:34:d6:0f:81";
    $moduleData->moduleName = "fake7";
    $moduleData->moduleId = 406;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.143";
    $moduleData->mac = "18:fe:34:d6:0f:82";
    $moduleData->moduleName = "fake8";
    $moduleData->moduleId = 407;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);

    $moduleData->ip = "192.168.1.144";
    $moduleData->mac = "18:fe:34:d6:0f:83";
    $moduleData->moduleName = "fake9";
    $moduleData->moduleId = 408;
    $requester->updateModuleData($moduleData);

    $weatherData->mac = $moduleData->mac;
    $weatherData->temperature1 = randForValue($savedTemperature);
    $weatherData->temperature2 = randForValue($savedTemperature);
    $weatherData->temperature3 = randForValue($savedTemperature);
    $weatherData->temperature4 = randForValue($savedTemperature);
    $weatherData->humidity1 = randForValue($savedHumidity);
    $weatherData->humidity2 = randForValue($savedHumidity);
    $weatherData->humidity3 = randForValue($savedHumidity);
    $weatherData->humidity4 = randForValue($savedHumidity);
    $requester->addWeatherData($weatherData);
}

////////////////////////////////////////////////////////////////////////////////////////////

$data = array(
    'id' => $id,
    'moduleid' => $moduleId,
    'modulename' => $moduleName,
    'temperature1' => $temperature1,
    'temperature2' => $temperature2,
    'temperature3' => $temperature3,
    'temperature4' => $temperature4,
    'humidity1' => $humidity1,
    'humidity2' => $humidity2,
    'humidity3' => $humidity3,
    'humidity4' => $humidity4,
    'pressure1' => $pressure1,
    'pressure2' => $pressure2,
    'pressure3' => $pressure3,
    'pressure4' => $pressure4,
    'illumination' => $illumination,
    'co2' => $co2level,
    'year' => (int)date('Y'),
    'month' => (int)date('m'),
    'day' => (int)date('d'),
    'hour' => (int)date('H'),
    'minute' => (int)date('i'),
    'second' => (int)date('s')
);

print json_encode($data);

?>