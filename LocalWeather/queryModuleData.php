<?php

//request Module data from database

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
$sortClause = "";
if (isset($sortBy)) {
    $sortClause = " ORDER BY $sortBy";
}

$requester = new Requester;
$allData = $requester->getData("SELECT * FROM WeatherModule $sortClause");

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>