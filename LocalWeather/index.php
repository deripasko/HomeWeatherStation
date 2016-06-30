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