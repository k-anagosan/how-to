const mix = require("laravel-mix");
const tailwind = require("tailwindcss");
const fs = require("fs");

mix.webpackConfig({
    watchOptions: {
        ignored: /node_modules|vendor/,
    },
})
    .js("resources/js/app.js", "public/js")
    .browserSync({
        proxy: "http://web", // webサーバとして使用するコンテナ名をhttp://のあとに指定
        files: ["./resources/js/**/*.*", "./resources/views/**/*.blade.php"], // 監視対象のファイル、ディレクトリをwebpack.mix.jsからの相対パスとして指定する。
        open: false,
    });

// コンパイルに時間がかかるので/public/css/app.cssが無いときだけコンパイル
if (!fs.existsSync("./public/css/app.css")) {
    mix.postCss("./resources/css/app.css", "./public/css/", [tailwind]);
}

// production環境の場合はapp.prod.cssとして出力
if (mix.inProduction()) {
    mix.postCss("./resources/css/app.css", "./public/css/app.prod.css", [
        tailwind,
    ]);
    mix.version();
}
