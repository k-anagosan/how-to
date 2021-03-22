<?php

namespace App\Providers;

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
}
