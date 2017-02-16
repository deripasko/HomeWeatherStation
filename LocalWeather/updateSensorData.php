<?php

//update Sensor data in database

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        exit();
    }
}

include_once("requester.php");

$sensorId = (int)$_REQUEST["id"];

global $userSessionVarName;
$userId = $_SESSION[$userSessionVarName]->userId;

$chartVisibility = null;
$tableVisibility = null;

$requester = new Requester;

if (isset($_REQUEST["chartVisibility"])) {
    $chartVisibility = (int)$_REQUEST["chartVisibility"];
}

if (isset($_REQUEST["tableVisibility"])) {
    $tableVisibility = (int)$_REQUEST["tableVisibility"];
}

$requester->updateSensorData($userId, $sensorId, $chartVisibility, $tableVisibility);

$allData = (object) [];
$allData->sensorsData = $requester->getData("SELECT SensorID, TableVisibility, ChartVisibility FROM SensorData");
print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>