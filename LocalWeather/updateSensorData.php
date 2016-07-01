<?php

//update Sensor data in database

include_once("siteConfig.php");
session_start();

if ($publicServer) {
    if (!isset($_SESSION["username"])) {
        exit();
        return;
    }
}

include_once("requester.php");

$id = (int)$_REQUEST["id"];

$requester = new Requester;

if (isset($_REQUEST["chartVisibility"])) {
    $chartVisibility = (int)$_REQUEST["chartVisibility"];
    $requester->updateData("UPDATE WeatherSensor SET ChartVisibility = $chartVisibility WHERE ID = $id");
}

if (isset($_REQUEST["tableVisibility"])) {
    $tableVisibility = (int)$_REQUEST["tableVisibility"];
    $requester->updateData("UPDATE WeatherSensor SET TableVisibility = $tableVisibility WHERE ID = $id");
}

$allData = $requester->getData("SELECT * FROM WeatherSensor");

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>