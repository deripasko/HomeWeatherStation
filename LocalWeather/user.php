<?php

include_once("siteConfig.php");
include_once("include/common.php");

session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?user");
        exit();
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Личный кабинет</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/userController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div class="pageContainer userPageContainer" id="pageContainer">
    <div class="is-responsive">
        <div class="col-sm-12 col-md-12">
            <form>
                <div class="form-group row">
                    <label class="col-sm-4 form-control-label">Email</label>
                    <div class="col-sm-8">
                        <p class="form-control-static">email@example.com</p>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputEmail3" class="col-sm-4 form-control-label">Email</label>
                    <div class="col-sm-8">
                        <input type="email" class="form-control" id="inputEmail3" placeholder="Email">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputPassword3" class="col-sm-4 form-control-label">Password</label>
                    <div class="col-sm-8">
                        <input type="password" class="form-control" id="inputPassword3" placeholder="Password">
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-offset-4 col-sm-8">
                        <button type="submit" class="btn btn-secondary">Sign in</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>


<script type="text/javascript">
    var userPage;
    $(document).ready(function() {
        userPage = userController();
    });
</script>

</body>
</html>