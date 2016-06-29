<?php
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: /login.php?setup");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Настройки</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/setupController.js" type="text/javascript"></script>
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

<div id="editModuleModal" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="moduleModalTitle">Modal Header</h4>
            </div>
            <div class="modal-body">
                <div class="form-group row">
                    <label for="inputDescription" class="col-sm-2 form-control-label">Описание:</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="inputDescription" placeholder="Описание модуля" />
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-2">&nbsp;</label>
                    <div class="col-sm-10">
                        <div class="checkbox checkbox-warning">
                            <input type="checkbox" id="inputActive" />
                            <label for="inputActive">Модуль активен</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" id="btnSaveModule">Сохранить</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
            </div>
        </div>
    </div>
    <input id="inputMAC" type="hidden" />
</div>

<div class="pageContainer" id="pageContainer"></div>
<p class="jumboMessage" id="jumboMessage">Здесь будут отображаться карточки модулей, подключенных к Домашней метеостанции.</p>

<script type="text/javascript">
    var setupPage;
    $(document).ready(function() {
        setupPage = setupController();
    });
</script>

</body>
</html>