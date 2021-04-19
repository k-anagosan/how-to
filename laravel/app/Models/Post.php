<?php

namespace App\Models;

use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudContentRepository;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\PostFilename;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = ['content', 'likes_count', 'liked_by_me'];

    protected $visible = [
        'id', 'title', 'author', 'tags', 'likes_count', 'liked_by_me',
    ];

    protected $perPage = 18;

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id', 'id', 'users');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes')->withTimestamps();
    }

    public function getContentAttribute()
    {
        return resolve(CloudContentRepository::class)
            ->read(PostFilename::create($this->attributes['filename']))->toString();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes->count();
    }

    public function getLikedByMeAttribute()
    {
        $userRepository = resolve(UserRepository::class);

        if ($userRepository->isGuest()) {
            return false;
        }

        return $this->likes->contains(
            fn ($user) => $user->id === $userRepository->getLoginUserId()
        );
    }
}
