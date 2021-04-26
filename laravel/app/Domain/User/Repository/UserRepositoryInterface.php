<?php

namespace App\Domain\User\Repository;

use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

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
     *
     * @return bool
     */
    public function isGuest(): bool;

    /**
     * 引数のUsernameがUserテーブルに存在するか真偽値で返す.
     * @param Usrename $username
     * @return bool
     */
    public function existsByUsername(Username $username);
}
