<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="theme-color" content="#2A2D35">
    <meta name="msapplication-navbutton-color" content="#2A2D35"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="#2A2D35"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Домашняя метеостанция - Настройки</title>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="styles/styles.css" type="text/css" />
    <link rel="stylesheet" href="styles/bootstrap.min.css" type="text/css" />
    <link rel="stylesheet" href="styles/jquery.dropdown.min.css" type="text/css" />
    <link rel="stylesheet" href="styles/bootstrap-theme.min.css" type="text/css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js" type="text/javascript"></script>
    <script src="scripts/CommonUtil.js" type="text/javascript"></script>
    <script src="scripts/queryHelper.js" type="text/javascript"></script>
    <script src="scripts/setupController.js" type="text/javascript"></script>
    <script src="scripts/bootstrap.min.js" type="text/javascript"></script>
    <script src="scripts/dateFormat.js" type="text/javascript"></script>
    <script type="text/javascript" src="scripts/jquery.dropdown.min.js"></script>
    <script type="text/javascript">
        var timerStart = Date.now();
    </script>
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
                <li><a href="/charts.php">Графики</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li class="active"><a href="/setup.php">Настройки</a></li>
            </ul>
        </div>
    </div>
</nav>

<div id="editModuleModal" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="moduleModalTitle">Modal Header</h4>
            </div>
            <div class="modal-body">
                <p>Some text in the modal.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" id="btnSaveModule">Сохранить</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
            </div>
        </div>
    </div>
</div>

<div class="pageContainer" id="pageContainer"></div>

<script type="text/javascript">
    var setupPage;
    $(document).ready(function() {
        setupPage = setupController();
    });
</script>

</body>
</html>