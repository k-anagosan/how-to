<?php

namespace App\Domain\User\Repository;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class EloquentUserRepository implements UserRepository
{
    public function getLoginUserId(): UserAccountId
    {
        return UserAccountId::create(Auth::id());
    }

    public function isGuest(): bool
    {
        return Auth::guest();
    }

    public function existsByUsername(Username $username)
    {
        return User::where('name', 'like', $username->toString())->exists();
    }
}
