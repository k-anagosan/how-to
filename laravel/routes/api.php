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

Route::name('user.')->prefix('user')->group(function (): void {
    Route::get('{name}', App\Http\Actions\GetUserPageDataAction::class)->name('data');
    Route::get('{name}/articles', App\Http\Actions\GetUserArticleListAction::class)->name('show');
    Route::get('{name}/archives', App\Http\Actions\GetArchivedArticleListAction::class)->name('archives');
    Route::get('{name}/likes', App\Http\Actions\GetLikedArticleListAction::class)->name('likes');
    Route::get('{name}/followers', App\Http\Actions\GetFollowerListAction::class)->name('followers');

    Route::put('{id}/follow', App\Http\Actions\FollowUserAction::class)->name('follow');
    Route::delete('{id}/follow', App\Http\Actions\DeleteFollowUserAction::class)->name('delete.follow');
});

Route::post('/post', App\Http\Actions\PostAction::class)->name('post.create');

Route::name('post.')->prefix('post')->group(function (): void {
    Route::get('{id}', App\Http\Actions\GetArticleAction::class)->name('show');
    Route::delete('{id}', App\Http\Actions\DeleteArticleAction::class)->name('delete');

    Route::put('{id}/like', App\Http\Actions\LikeAction::class)->name('like');
    Route::delete('{id}/like', App\Http\Actions\DeleteLikeAction::class)->name('delete.like');

    Route::put('{id}/archive', App\Http\Actions\ArchiveAction::class)->name('archive');
    Route::delete('{id}/archive', App\Http\Actions\DeleteArchiveAction::class)->name('delete.archive');
});

Route::get('/posts', App\Http\Actions\GetArticleListAction::class)->name('posts');

Route::post('/photo', App\Http\Actions\PostPhotoAction::class)->name('photo.create');
