<?php
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: /login.php?datas");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Данные</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/datasController.js" type="text/javascript"></script>
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
                <li class="active"><a href="/datas.php">Данные</a></li>
                <li><a href="/charts.php">Графики</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="/setup.php">Настройки</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><?php echo $_SESSION["username"] ?>&nbsp;<span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href="/user.php">Личный кабинет</a></li>
                        <li role="separator" class="divider"></li>
                        <li><a href="/logout.php">Выход</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="pageContainer">

    <div class="panel-group">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" href="#collapse1">Настроить параметры фильтрации &#8595;</a>
                </h4>
            </div>
            <div id="collapse1" class="panel-collapse collapse">
                <div class="panel-body">
                    <p>Отображать данные с выбранных модулей (если ничего не выбрано - будут показаны все данные):</p>
                    <div id="modulesList"></div>
                    <hr/>
                    <p>Отображать данные с сенсоров:</p>
                    <div id="sensorsList"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="results"></div>
    <div id="pager"></div>

    <div id="jq-dropdown-1" class="jq-dropdown jq-dropdown-tip">
        <ul class="jq-dropdown-menu">
            <li><a class="pageSizeItem">10</a></li>
            <li><a class="pageSizeItem">20</a></li>
            <li><a class="pageSizeItem">40</a></li>
        </ul>
    </div>
</div>

<script type="text/javascript">
    var datasPage;
    $(document).ready(function() {
        datasPage = datasController();
    });
</script>

</body>
</html>