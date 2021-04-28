<?php

namespace App\UseCase;

use App\Domain\ValueObject\UserAccountId;

final class FollowUserUseCase
{
    public function __construct()
    {
    }

    public function execute(UserAccountId $userId)
    {
        return $userId;
    }
}
