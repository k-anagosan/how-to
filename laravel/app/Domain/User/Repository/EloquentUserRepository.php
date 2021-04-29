<?php

namespace App\Domain\User\Repository;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function getUserIdByUsername(Username $username)
    {
        $user = User::where('name', 'like', $username->toString());

        if (!$user->exists()) {
            return;
        }

        return UserAccountId::create($user->first()->id);
    }

    public function exists(UserAccountId $userId)
    {
        return User::where('id', $userId->toInt())->exists();
    }

    public function putFollow(UserAccountId $userId, UserAccountId $followId)
    {
        $user = User::with(['follows'])->find($userId->toInt());

        if (!$user) {
            return;
        }

        DB::beginTransaction();

        try {
            $user->follows()->detach($followId->toInt());
            $user->follows()->attach($followId->toInt());

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $followId;
    }
}
