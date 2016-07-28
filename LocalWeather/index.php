<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?index");
        exit();
    }
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

<?php include_once("include/menu.php"); ?>

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