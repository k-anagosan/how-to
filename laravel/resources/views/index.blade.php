<!DOCTYPE html>
<html lang='{{str_replace("_", "-", app()->getLocale())}}'>

<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{{config("app.name")}}</title>
    @if(env("APP_ENV") === "local" || env("APP_ENV") === "testing")
    <link rel='stylesheet' href='{{asset("/css/app.css")}}'>
    <script src="{{asset("/js/app.js")}}" defer></script>
    @else
    <link rel='stylesheet' href='{{mix("/css/app.prod.css")}}'>
    <script src="{{mix("/js/app.js")}}" defer></script>
    @endif
    <script type="module" src="https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.esm.js"></script>
</head>

<body>
    <div id='app'></div>
</body>

</html>