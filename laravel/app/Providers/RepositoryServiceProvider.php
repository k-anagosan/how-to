<?php

namespace App\Providers;

use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface;
use App\Domain\Photo\Repository\EloquentPhotoRepository;
use App\Domain\Photo\Repository\PhotoRepositoryInterface;
use App\Domain\Photo\Repository\S3PhotoRepository;
use App\Domain\Post\Repository\EloquentPostRepository;
use App\Domain\Post\Repository\PostRepositoryInterface;
use App\Domain\User\Repository\EloquentUserRepository;
use App\Domain\User\Repository\UserRepositoryInterface;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider implements DeferrableProvider
{
    public $singletons = [
        UserRepositoryInterface::class => EloquentUserRepository::class,
        PostRepositoryInterface::class => EloquentPostRepository::class,
        PhotoRepositoryInterface::class => EloquentPhotoRepository::class,
        CloudPhotoRepositoryInterface::class => S3PhotoRepository::class,
    ];

    public function provides()
    {
        return [
            UserRepositoryInterface::class,
            PostRepositoryInterface::class,
            PhotoRepositoryInterface::class,
            CloudPhotoRepositoryInterface::class,
        ];
    }
}
