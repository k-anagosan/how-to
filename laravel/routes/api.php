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
Route::get('/user/{name}', App\Http\Actions\GetUserIdAction::class)->name('user.id');
Route::get('/user/{name}/articles', App\Http\Actions\GetUserPageAction::class)->name('user.show');

Route::put('/user/{id}/follow', App\Http\Actions\FollowUserAction::class)->name('user.follow');
Route::delete('/user/{id}/follow', App\Http\Actions\UnfollowUserAction::class)->name('user.unfollow');

Route::post('/post', App\Http\Actions\PostAction::class)->name('post.create');
Route::get('/post/{id}', App\Http\Actions\GetArticleAction::class)->name('post.show');
Route::put('/post/{id}/like', App\Http\Actions\LikeAction::class)->name('post.like');
Route::delete('/post/{id}/unlike', App\Http\Actions\UnlikeAction::class)->name('post.unlike');

Route::get('/posts', App\Http\Actions\GetArticleListAction::class)->name('posts');

Route::post('/photo', App\Http\Actions\PostPhotoAction::class)->name('photo.create');
