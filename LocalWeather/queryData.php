<?php

//request data from database

include_once("siteConfig.php");
session_start();

if ($publicServer) {
    if (!isset($_SESSION["username"])) {
        exit();
        return;
    }
}

include_once("requester.php");

$getSensors = (int)$_REQUEST["getSensors"] == 1;
$getModules = (int)$_REQUEST["getModules"] == 1;
$getWeather = (int)$_REQUEST["getWeather"] == 1;

$allData = (object) [];

$requester = new Requester;

if ($getSensors) {
    $allData->sensors = $requester->getData("SELECT * FROM WeatherSensor ORDER BY SortOrder");
}

if ($getSensors) {

    $sortBy = $_REQUEST["modulesSortBy"];
    $sortClause = "";
    if (isset($sortBy)) {
        $sortClause = " ORDER BY $sortBy";
    }

    $allData->modules = $requester->getData("SELECT * FROM WeatherModule $sortClause");
}

if ($getWeather) {

    $sortBy = $_REQUEST["sortBy"];
    $sortAscending = ($_REQUEST["sortAscending"] == "true") ? "ASC" : "DESC";
    $pageIndex = (int)$_REQUEST["pageIndex"];
    $pageSize = (int)$_REQUEST["pageSize"];
    $queryType = $_REQUEST["queryType"];
    $interval = $_REQUEST["interval"];
    $filteredMacs = $_REQUEST["filteredMacs"];

    $params = (object) [];
    $params->sortBy = $sortBy;
    $params->sortAscending = $sortAscending;
    $params->pageIndex = $pageIndex;
    $params->pageSize = $pageSize;
    $params->queryType = $queryType;
    $params->interval = $interval;
    $params->filteredMacs = $filteredMacs;

    $allData->weather = $requester->getWeatherData($params);
}

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>