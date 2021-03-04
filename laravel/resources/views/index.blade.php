<!DOCTYPE html>
<html lang='{{str_replace("_", "-", app()->getLocale())}}'>

<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{{config("app.name")}}</title>
    @if(env("APP_DEBUG"))
    <link rel='stylesheet' href='{{mix("/css/app.css")}}'>
    @else
    <link rel='stylesheet' href='{{mix("/css/app.prod.css")}}'>
    @endif
    <script src="{{mix("/js/app.js")}}" defer></script>
</head>

<body>
    <div id='app'></div>
</body>

</html>