<?php

namespace App\Domain\User\Repository;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use Illuminate\Support\Facades\Auth;

class EloquentUserRepository implements UserRepository
{
    public function getLoginUserId(): UserAccountId
    {
        return UserAccountId::create(Auth::id());
    }
}
