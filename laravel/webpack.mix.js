const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */
mix.webpackConfig({
    watchOptions: {
        ignored: /node_modules|vendor/
    }
})
    .js("resources/js/app.js", "public/js")
    .sass("resources/sass/app.scss", "public/css")
    .browserSync({
        proxy: "http://web", // webサーバとして使用するコンテナ名をhttp://のあとに指定
        files: ["./resources/**/*.*", "./public/**/*.*"], // 監視対象のファイル、ディレクトリをwebpack.mix.jsからの相対パスとして指定する。
        open: false
    });
