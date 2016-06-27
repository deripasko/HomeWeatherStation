<?php

//request Sensor data from database

include_once("requester.php");

$requester = new Requester;
$allData = $requester->getData("SELECT * FROM WeatherSensor ORDER BY SortOrder");

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>