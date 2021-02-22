<!DOCTYPE html>
<html lang='{{str_replace("_", "-", app()->getLocale())}}'>

<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{{config("app.name")}}</title>
    <link rel='stylesheet' href='{{mix("css/app.css")}}'>
    <script src="{{mix("js/app.js")}}" defer></script>
</head>

<body>
    <div id='app'></div>
</body>

</html>