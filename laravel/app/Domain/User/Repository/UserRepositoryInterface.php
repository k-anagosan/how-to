<?php

namespace App\Domain\User\Repository;

use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Password;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

interface UserRepositoryInterface
{
    /**
     * 現在の認証ユーザーのユーザーIDを取得.
     * @return UserAccountId
     */
    public function getLoginUserId(): UserAccountId;

    /**
     * 未ログイン状態であるかを取得.
     * @return bool
     */
    public function isGuest(): bool;

    /**
     * 引数のUsernameでUserテーブルからUserAccountIdを取得する.
     * @param Usrename $username
     * @return null|UserAccountId
     */
    public function getUserIdByUsername(Username $username);

    /**
     * 引数のユーザーIDのユーザーがログインユーザーにフォローされているかを返す.
     *
     * @param UserAccountId $userId
     * @return array
     */
    public function getFollowedByMe(UserAccountId $userId);

    /**
     * 引数のユーザーIDを持つユーザーが存在するか真偽値で返す.
     * @param UserAccountId $userId
     * @return bool
     */
    public function exists(UserAccountId $userId);

    /**
     * 引数のユーザーネームを持つユーザーが存在するか真偽値で返す.
     * @param Username $username
     * @return bool
     */
    public function existsUsername(Username $username);

    /**
     * 引数の情報をもとにフォロー情報を挿入する.
     * @param UserAccountId $userId
     * @param UserAccountId $followId
     * @return null|UserAccountId
     */
    public function putFollow(UserAccountId $userId, UserAccountId $followId);

    /**
     * 引数の情報をもとにフォロー情報を削除する.
     * @param UserAccountId $userId
     * @param UserAccountId $followId
     * @return null|UserAccountId
     */
    public function deleteFollow(UserAccountId $userId, UserAccountId $followId);

    /**
     * 引数のユーザーIDのユーザーをフォローしているユーザー一覧を返す.
     *
     * @param UserAccountId $userId
     * @return array
     */
    public function getFollowers(UserAccountId $userId);

    /**
     * 引数の情報をもとにユーザー情報を更新する.
     * 
     * @param UserAccountId $userId
     * @param Username $username
     * @param Email $email
     * @param password $password
     * 
     * @return UserAccountId 
     */
    public function update(UserAccountId $userId, Username $username, Email $email, Password $password);
}
