<?php

//request data from database

include_once("siteConfig.php");

if ($publicServer) {
    session_start();

    if (!isset($_SESSION["username"])) {
        exit();
        return;
    }
}

include_once("requester.php");

$getSensors = (isset($_REQUEST["getSensors"]) ? (int)$_REQUEST["getSensors"] : 0) == 1;
$getModules = (isset($_REQUEST["getModules"]) ? (int)$_REQUEST["getModules"] : 0) == 1;
$getWeather = (isset($_REQUEST["getWeather"]) ? (int)$_REQUEST["getWeather"] : 0) == 1;

$allData = (object) [];

$requester = new Requester;

if ($getSensors) {
    $allData->sensors = $requester->getData("SELECT * FROM WeatherSensor ORDER BY SortOrder");
}

if ($getModules) {

    $sortBy = (isset($_REQUEST["modulesSortBy"])) ? $_REQUEST["modulesSortBy"] : null;
    $sortClause = "";
    if (isset($sortBy)) {
        $sortClause = " ORDER BY $sortBy";
    }

    $allData->modules = $requester->getData("SELECT * FROM WeatherModule $sortClause");
}

if ($getWeather) {

    $interval = "";

    $sortBy = isset($_REQUEST["sortBy"]) ? $_REQUEST["sortBy"] : "ID";
    $sortAscending = isset($_REQUEST["sortAscending"]) ? (($_REQUEST["sortAscending"] == "true") ? "ASC" : "DESC") : "ASC";
    $pageIndex = isset($_REQUEST["pageIndex"]) ? (int)$_REQUEST["pageIndex"] : 0;
    $pageSize = isset($_REQUEST["pageSize"]) ? (int)$_REQUEST["pageSize"] : 20;
    $queryType = $_REQUEST["queryType"];
    if ($queryType != "all")
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