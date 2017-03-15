<?php

include_once("siteConfig.php");

//$databaseHost = "localhost";
//$databaseName = "host1402357";
//$databaseLogin = "host1402357";
//$databasePassword = "9987f7f7";

$databaseHost = "localhost";
$databaseName = "host1402357";
$databaseLogin = "root";
$databasePassword = "";

if (!$publicServer) {
    $databaseHost = "localhost";
    $databaseName = "host1402357";
    $databaseLogin = "root";
    $databasePassword = "";
}

?>