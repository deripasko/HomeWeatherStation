<?php

if ($publicServer)
    session_start();

include_once("dbconfig.php");
include_once("emailConfig.php");
include_once("lib/password.php");

require 'lib/PHPMailer/PHPMailerAutoload.php';

class Requester
{
    private function getGUID() {

        if (function_exists('com_create_guid')){
            return com_create_guid();
        }
        else {
            mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45);// "-"
            $uuid = chr(123)// "{"
                .substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12)
                .chr(125);// "}"

            return $uuid;
        }
    }

    public function updateData($query) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        mysqli_query($link, $query);

        mysqli_close($link);
    }

    private function getFieldsArray($result) {

        $fieldsArray = array();
        $fieldInfo = mysqli_fetch_fields($result);

        foreach ($fieldInfo as $meta)
        {
            if (!$meta)
            {
            }
            else
            {
                $metaData = array(
                    "name" => $meta->name,
                    "type" => $meta->type
                );
                array_push($fieldsArray, $metaData);
            }
        }

        return $fieldsArray;
    }

    private function getDataArray($result, $fieldsArray) {

        $dataArray = array();

        while ($line = mysqli_fetch_assoc($result))
        {
            $sensorData = (object)[];
            $i = 0;

            foreach ($line as $col_value)
            {
                $columnName = $fieldsArray[$i]["name"];
                $columnType = $fieldsArray[$i]["type"];

                if ($col_value == null)
                {
                    $sensorData->$columnName = null;
                }
                else {
                    if ($columnType == "string" || $columnType == "blob")
                        $sensorData->$columnName = $col_value; //iconv('windows-1251', 'utf-8', $col_value);
                    if ($columnType == "real")
                        $sensorData->$columnName = (float)$col_value;
                    if ($columnType == "int")
                        $sensorData->$columnName = (int)$col_value;
                    if ($columnType == "timestamp")
                        $sensorData->$columnName = $col_value;
                }

                $i++;
            }
            array_push($dataArray, $sensorData);
        }

        return $dataArray;
    }

    public function getData($query) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        mysqli_query($link, "SET CHARACTER SET 'utf8'");
        mysqli_query($link, "SET character_set_client = 'utf8'");
        mysqli_query($link, "SET character_set_results = 'utf8'");
        mysqli_query($link, "SET collation_connection = 'utf8_general_ci'");
        mysqli_query($link, "SET NAMES utf8");

        $result = mysqli_query($link, $query);

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);

        $allData = array(
            "fields" => $fieldsArray,
            "data" => $dataArray
        );

        mysqli_free_result($result);
        mysqli_close($link);

        return $allData;
    }

    public function getWeatherData($params) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        $macFilter = "1 = 1";
        if ($params->filteredMacs != "") {
            $macFilter = "LOCATE(wd.ModuleMAC, '$params->filteredMacs') <> 0";
        }

        if ($params->queryType == "all") {
            // called from Datas page
            $rowsToSkip = $params->pageIndex * $params->pageSize;
            $query = "SELECT SQL_CALC_FOUND_ROWS wd.ID, wm.MAC, wm.ModuleName, wm.ModuleID, wm.Description,".
                     " wd.Temperature1, wd.Temperature2, wd.Temperature3, wd.Temperature4,".
                     " wd.Humidity1, wd.Humidity2, wd.Humidity3, wd.Humidity4,".
                     " wd.Pressure1, wd.Pressure2, wd.Pressure3, wd.Pressure4,".
                     " wd.Illumination, wd.CO2, wd.MeasuredDateTime".
                     " FROM WeatherData wd".
                     " JOIN WeatherModule wm ON wm.MAC = wd.ModuleMAC WHERE $macFilter ORDER BY $params->sortBy $params->sortAscending LIMIT $rowsToSkip, $params->pageSize";
        } else {
            // called from Charts page
            $query = "SELECT wd.* FROM WeatherData wd WHERE DATE_SUB(NOW(), INTERVAL $params->interval) < MeasuredDateTime AND $macFilter";
        }

        $result = mysqli_query($link, $query);

        $queryRowsCount = "SELECT FOUND_ROWS()";
        $resultRowsCount = mysqli_query($link, $queryRowsCount);

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);

        $rowsCount = 0;
        while ($line = mysqli_fetch_assoc($resultRowsCount))
        {
            foreach ($line as $col_value)
            {
                $rowsCount = $col_value;
                break;
            }
        }

        $allData = array(
            "fields" => $fieldsArray,
            "data" => $dataArray,
            "sortBy" => $params->sortBy,
            "sortAscending" => $params->sortAscending == "ASC",
            "pageIndex" => $params->pageIndex,
            "pageSize" => $params->pageSize,
            "filteredMacs" => $params->filteredMacs,
            "rowsCount" => (int)$rowsCount
        );

        mysqli_free_result($result);
        mysqli_close($link);

        return $allData;
    }

    public function checkUser($email) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        $email = trim($email);
        $query = "SELECT ID FROM WeatherUser WHERE LOWER(Email) = LOWER('$email')";

        $result = mysqli_query($link, $query);
        $count = mysqli_num_rows($result);

        mysqli_free_result($result);
        mysqli_close($link);

        return $count;
    }

    public function registerUser($email, $password) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        $email = trim($email);
        $password = password_hash(trim($password), PASSWORD_DEFAULT);
        $code = substr(str_replace("-", "", trim($this->getGUID(), "{}")), 0, 16);

        $query = "INSERT INTO WeatherUser (UserName, Email, Password, VerificationCode) VALUES (LOWER('$email'), LOWER('$email'), '$password', UPPER('$code'))";
        mysqli_query($link, $query);

        $id = mysqli_insert_id($link);
        mysqli_close($link);

        $this->sendEmail($email, "Регистрация на сайте Домашней метеостанции",
            "Для окончания регистрации введите проверочный код<br/><b>$code</b><br/>в личном кабинете пользователя в течение трёх дней.");

        return $id;
    }

    public function loginUser($email, $password, $setCookie) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        $email = trim($email);
        $password = trim($password);

        $query = "SELECT Password, UserName FROM WeatherUser WHERE LOWER('$email') = LOWER(Email)";
        $result = mysqli_query($link, $query);

        $line = mysqli_fetch_row($result);
        $databasePassword = $line[0];
        $databaseUserName = $line[1];
        $result = password_verify($password, $databasePassword);

        if ($result) {
            $_SESSION["username"] = $databaseUserName;
            if ($setCookie == 1) {
                setcookie("username", $databaseUserName, strtotime('+1 year'));
            }
        }

        mysqli_close($link);

        return $result;
    }

    public function validateUser($code) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        $query = "UPDATE WeatherUser SET IsActive = 1, VerifiedDateTime = CURRENT_TIMESTAMP WHERE VerificationCode = '$code'";
        mysqli_query($link, $query);

        mysqli_close($link);
    }

    private function sendEmail($to, $subject, $text) {

        global $emailLogin;
        global $emailPassword;
        global $emailServer;
        global $emailFrom;

        $mail = new PHPMailer;

        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->Host = $emailServer;                           // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = $emailLogin;                        // SMTP username
        $mail->Password = $emailPassword;                     // SMTP password
        $mail->Port = 25;                                     // TCP port to connect to

        $mail->setFrom($emailFrom, 'Домашняя метеостанция');
        $mail->addAddress($to, $to);                          // Add a recipient

        $mail->isHTML(true);                                  // Set email format to HTML

        $mail->Subject = $subject;
        $mail->Body    = $text;
        $mail->CharSet = 'utf-8';

        if(!$mail->send()) {
            return false;
        } else {
            return true;
        }
    }

}

?>