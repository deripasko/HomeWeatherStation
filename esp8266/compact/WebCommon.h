#ifndef WEBCOMMON_H
#define WEBCOMMON_H

#include <Arduino.h>
#include "JsonConfig.h"

const char stylesInclude[] PROGMEM = "<link rel='stylesheet' type='text/css' href='/styles.css' />";

const char mainMenu[] PROGMEM = "<div class='header'><ul>\
<li><a href='/'>Home</a></li>\
<li><a href='/setup'>Setup</a></li>\
<li><a href='/time'>Time</a></li>\
<li><a href='/sensors'>Sensors</a></li>\
<li><a class='reboot' href='/reboot?reboot_delay=%d'>Reboot</a></li>\
</ul></div>";

const char stylesBootstrap[] PROGMEM =
"a {text-decoration: none;}\
hr {margin-top: 20px; margin-bottom: 20px; border: 0; border-top: 1px solid #eee;}\
.input-group {position: relative; display: table; border-collapse: separate; margin: 10px;}\
.input-group-addon:first-child {border-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;}\
.input-group .form-control:last-child {border-top-left-radius: 0; border-bottom-left-radius: 0;}\
.input-group-addon {padding: 6px 12px; font-size: 14px; font-weight: 400; line-height: 1; color: #555; text-align: center; background-color: #eee; border: 1px solid #ccc; border-radius: 4px;}\
.input-group-addon {width: 200px; white-space: nowrap; vertical-align: middle;}\
.input-group .form-control, .input-group-addon {display: table-cell;}\
.input-group .form-control {position: relative; z-index: 2; float: left; width: 200px; margin-bottom: 0;}\
.form-control {display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; color: #555; background-color: #fff;\
background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\
box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075); -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;\
-o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s; transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;}\
.form-control:focus {border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\
box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);}\
.marginTop0 { margin-top: 0 !important;}\
.btn { display: inline-block; padding: 6px 12px; margin: 20px; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center;\
white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer;\
-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; border-radius: 4px;}\
.btn-default { color: #333; background-color: #fff; border-color: #ccc;}\
.btn-default {text-shadow: 0 -1px 0 rgba(0,0,0,.2); -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.15),0 1px 1px rgba(0,0,0,.075);\
box-shadow: inset 0 1px 0 rgba(255,255,255,.15),0 1px 1px rgba(0,0,0,.075);}\
.btn-default {text-shadow: 0 1px 0 #fff; background-image: -webkit-linear-gradient(top,#fff 0,#e0e0e0 100%);\
background-image: -o-linear-gradient(top,#fff 0,#e0e0e0 100%); background-image: -webkit-gradient(linear,left top,left bottom,from(#fff),to(#e0e0e0));\
background-image: linear-gradient(to bottom,#fff 0,#e0e0e0 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe0e0e0', GradientType=0);\
background-repeat: repeat-x; border-color: #dbdbdb; }\
";

const char stylesBootstrapAlerts[] PROGMEM = "\
.alert {padding: 15px; margin-bottom: 20px; margin-top: 20px; border: 1px solid transparent; border-radius: 4px; }\
.alert-danger {color: #a94442; background-color: #f2dede; border-color: #ebccd1; }\
.alert-info { color: #31708f; background-color: #d9edf7; border-color: #bce8f1; }\
.alert {text-shadow: 0 1px 0 rgba(255,255,255,.2); -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 2px rgba(0,0,0,.05); box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 2px rgba(0,0,0,.05); }\
.alert-danger {background-image: -webkit-linear-gradient(top,#f2dede 0,#e7c3c3 100%); background-image: -o-linear-gradient(top,#f2dede 0,#e7c3c3 100%);\
background-image: -webkit-gradient(linear,left top,left bottom,from(#f2dede),to(#e7c3c3)); background-image: linear-gradient(to bottom,#f2dede 0,#e7c3c3 100%);\
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff2dede', endColorstr='#ffe7c3c3', GradientType=0); background-repeat: repeat-x; border-color: #dca7a7; }\
.alert-info { background-image: -webkit-linear-gradient(top,#d9edf7 0,#b9def0 100%); background-image: -o-linear-gradient(top,#d9edf7 0,#b9def0 100%);\
background-image: -webkit-gradient(linear,left top,left bottom,from(#d9edf7),to(#b9def0)); background-image: linear-gradient(to bottom,#d9edf7 0,#b9def0 100%);\
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffd9edf7', endColorstr='#ffb9def0', GradientType=0); background-repeat: repeat-x; border-color: #9acfea; }\
";

const char styles[] PROGMEM =
"body {font-family: tahoma; font-size: 14px;}\
.header {height: 30px; width: 100%; border-bottom: 1px solid #ddd;}\
.header ul {list-style: none; padding: 0;}\
.header ul li {float: left;}\
.header ul li a {padding: 10px; font-weight: bold; font-size: 16px; text-decoration: none; color: black;}\
.header ul li a:hover {color: #007acc;}\
.reboot {color: red !important;}\
.container {border: 1px solid #ddd; width: 400px; border-radius: 4px;}\
";

const char rebootScripts[] PROGMEM =
"<script type='text/javascript'>\
function \
getUrlVars()\
{\
var vars = [], hash;\
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');\
for(var i = 0; i < hashes.length; i++)\
{\
hash = hashes[i].split('=');\
vars.push(hash[0]);\
vars[hash[0]] = hash[1];\
}\
return vars;\
}\
window.onload = function() {\
var params = getUrlVars();\
var delay = parseInt(params['reboot_delay'], 10);\
console.log(delay);\
var txt = document.getElementById('info');\
var counter = delay;\
var id = setInterval(function () {\
txt.innerHTML = 'Module will reboot in ' + counter + ' second(s).';\
counter--;\
console.log(counter);\
if (counter < 0) {\
clearInterval(id);\
txt.innerHTML = 'Module was rebooted.';\
console.log('Reboot!');\
}\
}, 1000);\
}\
</script>";

const char scripts[] PROGMEM =
"<script type='text/javascript'>\
function \
setNowDateTime() {\
var today = new Date();\
var dd = today.getDate();\
var mm = today.getMonth() + 1;\
var yyyy = today.getFullYear();\
var h = today.getHours();\
var m = today.getMinutes();\
var s = today.getSeconds();\
document.getElementById('day').value = dd;\
document.getElementById('month').value = mm;\
document.getElementById('year').value = yyyy;\
document.getElementById('hour').value = h;\
document.getElementById('minute').value = m;\
document.getElementById('second').value = s;\
}\
function \
saveFormData(pageToRecall) {\
var data = [];\
var inputs = document.getElementsByTagName('input');\
for (var i = 0; i < inputs.length; i++) {\
var input = inputs[i];\
if (input.type == 'text' || input.type == 'password') {\
data.push({key: input.id, value: input.value});\
}\
}\
console.log(data);\
var url = pageToRecall + '?';\
for (var j = 0; j < data.length; j++) {\
var param = data[j];\
url += param.key + '=' + param.value + '&';\
}\
document.location = url;\
}\
</script>";

const char headEnd[] PROGMEM = "</head>";
const char bodyStart[] PROGMEM = "<body>";
const char bodyEnd[] PROGMEM = "</body></html>";

String renderParameterRow(String paramName, String paramId, String paramValue, int maxLength, bool isReadonly = false, bool isPassword = false);
String renderTitle(String pageName, String moduleName);
String renderAlert(String type, String text);
String renderStyles(String styles);
String renderMenu(String delay);

#endif

