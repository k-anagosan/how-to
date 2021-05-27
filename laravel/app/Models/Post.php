<?php

namespace App\Models;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = ['likes_count', 'liked_by_me'];

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
        return $this->belongsToMany(TagName::class, 'tags')->withTimestamps();
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes')->withTimestamps();
    }

    public function archives()
    {
        return $this->belongsToMany(User::class, 'archives')->withTimestamps();
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
            fn ($user) => $user->id === $userRepository->getLoginUserId()->toInt()
        );
    }
}
