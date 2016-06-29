<?php

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

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        mysql_query($query);

        mysql_close($link);
    }

    private function getFieldsArray($result) {

        $fieldsArray = array();
        $i = 0;

        while ($i < mysql_num_fields($result))
        {
            $meta = mysql_fetch_field($result, $i);
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
            $i++;
        }

        return $fieldsArray;
    }

    private function getDataArray($result, $fieldsArray) {

        $dataArray = array();

        while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
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
                        $sensorData->$columnName = iconv('windows-1251', 'utf-8', $col_value);
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

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        $result = mysql_query($query)
            or die("Query failed: " . mysql_error());

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);

        $allData = array(
            "fields" => $fieldsArray,
            "data" => $dataArray
        );

        mysql_free_result($result);
        mysql_close($link);

        return $allData;
    }

    public function getWeatherData($params) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

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

        $queryRowsCount = "SELECT FOUND_ROWS()";

        $result = mysql_query($query)
            or die("Query failed: " . mysql_error());

        $resultRowsCount = mysql_query($queryRowsCount)
            or die("Query failed: " . mysql_error());

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);

        $rowsCount = 0;
        while ($line = mysql_fetch_array($resultRowsCount, MYSQL_ASSOC))
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

        mysql_free_result($result);
        mysql_close($link);

        return $allData;
    }

    public function checkUser($email) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        $email = trim($email);
        $query = "SELECT ID FROM WeatherUser WHERE LOWER(Email) = LOWER('$email')";

        $result = mysql_query($query)
            or die("Query failed: " . mysql_error());

        $count = mysql_num_rows($result);

        mysql_free_result($result);
        mysql_close($link);

        return $count;
    }

    public function registerUser($email, $password) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        $email = trim($email);
        $password = password_hash(trim($password), PASSWORD_DEFAULT);
        $code = substr(str_replace("-", "", trim($this->getGUID(), "{}")), 0, 16);

        $query = "INSERT INTO WeatherUser (UserName, Email, Password, VerificationCode) VALUES (LOWER('$email'), LOWER('$email'), '$password', UPPER('$code'))";
        mysql_query($query)
            or die("Query failed: " . mysql_error());

        $id = mysql_insert_id();
        mysql_close($link);

        $this->sendEmail($email, "Регистрация на сайте Домашней метеостанции",
            "Для окончания регистрации введите проверочный код<br/><b>$code</b><br/>в личном кабинете пользователя в течение трёх дней.");

        return $id;
    }

    public function loginUser($email, $password, $setCookie) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        $email = trim($email);
        $password = trim($password);

        $query = "SELECT Password, UserName FROM WeatherUser WHERE LOWER('$email') = LOWER(Email)";
        $result = mysql_query($query)
            or die("Query failed: " . mysql_error());

        $line = mysql_fetch_row($result);
        $databasePassword = $line[0];
        $databaseUserName = $line[1];
        $result = password_verify($password, $databasePassword);

        if ($result) {
            $_SESSION["username"] = $databaseUserName;
            if ($setCookie == 1) {
                setcookie("username", $databaseUserName, strtotime('+1 year'));
            }
        }

        mysql_close($link);

        return $result;
    }

    public function validateUser($code) {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysql_connect($databaseHost, $databaseLogin, $databasePassword)
            or die("Could not connect : " . mysql_error());

        mysql_select_db($databaseName)
            or die("Could not select database");

        $query = "UPDATE WeatherUser SET IsActive = 1, VerifiedDateTime = CURRENT_TIMESTAMP WHERE VerificationCode = '$code'";
        mysql_query($query)
            or die("Query failed: " . mysql_error());

        mysql_close($link);
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