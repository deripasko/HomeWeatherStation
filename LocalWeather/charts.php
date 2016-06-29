<?php
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: /login.php?charts");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Графики</title>
    <?php include_once("include/header.php"); ?>
    <?php include_once("include/highcharts.php"); ?>
    <script src="scripts/chartsController.js" type="text/javascript"></script>
</head>
<body>

<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Показать меню</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/">Домашняя метеостанция</a>
        </div>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li><a href="/">Главная</a></li>
                <li><a href="/datas.php">Данные</a></li>
                <li class="active"><a href="/charts.php">Графики</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="/setup.php">Настройки</a></li>
            </ul>
        </div>
    </div>
</nav>

<div class="pageContainer">

    <div class="panel-group">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" href="#collapse1">Настроить параметры построения &#8595;</a>
                </h4>
            </div>
            <div id="collapse1" class="panel-collapse collapse">
                <div class="panel-body">

                    <p>Отображать данные с выбранных модулей (если ничего не выбрано - будут показаны все данные):</p>
                    <div id="modulesList"></div>

                    <hr/>

                    <div id="chartController"></div>
                    <div id="jq-dropdown-2" class="jq-dropdown jq-dropdown-tip">
                        <ul class="jq-dropdown-menu">
                            <li><a class="intervalItem" data-interval="1 HOUR">1 час</a></li>
                            <li><a class="intervalItem" data-interval="2 HOUR">2 часа</a></li>
                            <li><a class="intervalItem" data-interval="4 HOUR">4 часа</a></li>
                            <li><a class="intervalItem" data-interval="6 HOUR">6 часов</a></li>
                            <li><a class="intervalItem" data-interval="12 HOUR">12 часов</a></li>
                            <li><a class="intervalItem" data-interval="1 DAY">1 день</a></li>
                        </ul>
                    </div>

                    <hr/>

                    <p>Отображать данные с сенсоров:</p>
                    <div id="sensorsList"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="chartsContainer">
    </div>

</div>

<script type="text/javascript">
    var chartsPage;
    $(document).ready(function() {
        chartsPage = chartsController();
    });
</script>

</body>
</html>