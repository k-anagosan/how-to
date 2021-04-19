<?php

namespace App\Domain\User\Repository;

use App\Domain\ValueObject\UserAccountId;

interface UserRepositoryInterface
{
    /**
     * 現在の認証ユーザーのユーザーIDを取得.
     *
     * @return UserAccountId
     */
    public function getLoginUserId(): UserAccountId;

    /**
     * 未ログイン状態であるかを取得.
     */
    public function isGuest(): bool;
}
