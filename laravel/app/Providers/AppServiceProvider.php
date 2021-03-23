<?php

namespace App\Providers;

use App\Domain\Post\Repository\CloudContentRepositoryInterface;
use App\Domain\Post\Repository\EloquentPostRepository;
use App\Domain\Post\Repository\PostRepositoryInterface;
use App\Domain\Post\Repository\S3ContentRepository;
use App\Domain\User\Repository\EloquentUserRepository;
use App\Domain\User\Repository\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->authorRepositoryRegister();
        $this->postRepositoryRegister();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    }

    private function authorRepositoryRegister(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class
        );
    }

    private function postRepositoryRegister(): void
    {
        $this->app->bind(
            PostRepositoryInterface::class,
            EloquentPostRepository::class
        );
        $this->app->bind(
            CloudContentRepositoryInterface::class,
            S3ContentRepository::class
        );
    }
}
