<?php

namespace App\Providers;

use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface;
use App\Domain\Photo\Repository\EloquentPhotoRepository;
use App\Domain\Photo\Repository\PhotoRepositoryInterface;
use App\Domain\Photo\Repository\S3PhotoRepository;
use App\Domain\Post\Repository\CloudContentRepositoryInterface;
use App\Domain\Post\Repository\EloquentPostRepository;
use App\Domain\Post\Repository\PostRepositoryInterface;
use App\Domain\Post\Repository\S3ContentRepository;
use App\Domain\Post\Repository\TestCloudContentRepository;
use App\Domain\Tag\Repository\EloquentTagNameRepository;
use App\Domain\Tag\Repository\EloquentTagRepository;
use App\Domain\Tag\Repository\TagNameRepositoryInterface;
use App\Domain\Tag\Repository\TagRepositoryInterface;
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
        TagNameRepositoryInterface::class => EloquentTagNameRepository::class,
        TagRepositoryInterface::class => EloquentTagRepository::class,
    ];

    public function register(): void
    {
        $this->app->singleton(
            CloudContentRepositoryInterface::class,
            config('app.env') === 'local' ? TestCloudContentRepository::class : S3ContentRepository::class
        );
    }

    public function provides()
    {
        return [
            UserRepositoryInterface::class,
            PostRepositoryInterface::class,
            CloudContentRepositoryInterface::class,
            PhotoRepositoryInterface::class,
            CloudPhotoRepositoryInterface::class,
            TagNameRepositoryInterface::class,
            TagRepositoryInterface::class,
        ];
    }
}
