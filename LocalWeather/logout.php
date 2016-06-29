<?php
session_start();
session_unset();
session_destroy();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Выход</title>
    <?php include_once("include/header.php"); ?>
</head>
<body>

<div class="container">
    <div class="row">
        <div class="absolute-center is-responsive">
            <div class="col-sm-12 col-md-12">
                <form method="post" id="loginForm">
                    <div class="form-group text-center">
                        <img src="images/home-icon.png" height="128" width="128" />
                    </div>
                    <div class="form-group text-center">
                        <p class="jumboLoginMessage">Домашняя метеостанция</p>
                    </div>
                    <div id="errorPane" class="alert alert-info" role="alert">Выход выполнен. Для продолжения работы - <b><a href="/login.php">войдите</a></b> на сайт.</div>
                </form>
            </div>
        </div>
    </div>
</div>

</body>
</html>