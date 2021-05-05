<?php

namespace App\Models;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $appends = ['followed_by_me'];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $visible = [
        'name',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function follows()
    {
        return $this->belongsToMany(self::class, 'follows', 'user_id', 'follow_id')->withTimestamps();
    }

    public function followers()
    {
        return $this->belongsToMany(self::class, 'follows', 'follow_id', 'user_id')->withTimestamps();
    }

    public function getFollowedByMeAttribute()
    {
        $userRepository = resolve(UserRepository::class);

        if ($userRepository->isGuest()) {
            return false;
        }

        return $this->followers->contains(
            fn ($user) => $user->id === $userRepository->getLoginUserId()->toInt()
        );
    }
}
