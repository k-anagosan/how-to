<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/register', 'App\Http\Controllers\Auth\RegisterController@register')->name('register');
Route::post('/login', 'App\Http\Controllers\Auth\LoginController@login')->name('login');
Route::post('/logout', 'App\Http\Controllers\Auth\LoginController@logout')->name('logout');

Route::get('/user', fn () => Auth::check() ? Auth::user() : [])->name('user');

Route::post('/post', App\Http\Actions\PostAction::class)->name('post.create');
Route::get('/post/{id}', App\Http\Actions\GetArticleAction::class)->name('post.show');
Route::post('/photo', App\Http\Actions\PostPhotoAction::class)->name('photo.create');
