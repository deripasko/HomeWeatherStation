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

$id = (int)$_REQUEST["id"];

global $userSessionVarName;
$validationCode = $_SESSION[$userSessionVarName]->verificationCode;

$requester = new Requester;

if (isset($_REQUEST["chartVisibility"])) {
    $chartVisibility = (int)$_REQUEST["chartVisibility"];
    $requester->updateData("UPDATE ModuleSensor SET ChartVisibility = $chartVisibility WHERE SensorID = $id AND ModuleID IN (SELECT ModuleID FROM WeatherModule WHERE ValidationCode = '$validationCode')");
}

if (isset($_REQUEST["tableVisibility"])) {
    $tableVisibility = (int)$_REQUEST["tableVisibility"];
    $requester->updateData("UPDATE ModuleSensor SET TableVisibility = $tableVisibility WHERE SensorID = $id AND ModuleID IN (SELECT ModuleID FROM WeatherModule WHERE ValidationCode = '$validationCode')");
}

$allData = (object) [];
$allData->sensors = $requester->getData("SELECT ChartVisibility as chartVisibility, TableVisibility as tableVisibility, Description as description, IsActive as isActive, SensorId as sensorId FROM ModuleSensor");
print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>