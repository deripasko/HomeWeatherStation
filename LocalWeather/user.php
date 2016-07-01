<?php

include_once("siteConfig.php");
session_start();

if ($publicServer) {
    if (!isset($_SESSION["username"])) {
        header("Location: /login.php?user");
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Главная</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/userController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div class="pageContainer" id="pageContainer"></div>

<script type="text/javascript">
    var userPage;
    $(document).ready(function() {
        userPage = userController();
    });
</script>

</body>
</html>