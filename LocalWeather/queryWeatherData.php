<?php

//request Weather data from database

include_once("siteConfig.php");
session_start();

if ($publicServer) {
    if (!isset($_SESSION["username"])) {
        exit();
        return;
    }
}

include_once("requester.php");

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

$requester = new Requester;
$allData = $requester->getWeatherData($params);

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>