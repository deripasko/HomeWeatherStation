<?php
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: /login.php?index");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Главная</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/indexController.js" type="text/javascript"></script>
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
                <li class="active"><a href="/"><span class="glyphicon glyphicon-home" aria-hidden="true"></span>&nbsp;&nbsp;Главная</a></li>
                <li><a href="/datas.php"><span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>&nbsp;&nbsp;Данные</a></li>
                <li><a href="/charts.php"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>&nbsp;&nbsp;Графики</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="/setup.php"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span>&nbsp;&nbsp;Настройки</a></li>
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

<div class="pageContainer" id="pageContainer"></div>
<p class="jumboMessage" id="jumboMessage">Здесь будут отображаться карточки модулей, подключенных к Домашней метеостанции.</p>

<script type="text/javascript">
    var indexPage;
    $(document).ready(function() {
        indexPage = indexController();
    });
</script>

</body>
</html>