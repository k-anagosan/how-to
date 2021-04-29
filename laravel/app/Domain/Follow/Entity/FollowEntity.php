<?php

namespace App\Domain\Follow\Entity;

use App\Domain\ValueObject\UserAccountId;

class FollowEntity
{
    private $userId;

    private $followId;

    private function __construct()
    {
    }

    /**
     * LoginUserEntityによってのみこのインスタンスは生成される.
     * @param UserAccountId $userId
     * @param UserAccountId $followId
     */
    public static function createByLoginUser(
        UserAccountId $userId,
        UserAccountId $followId
    ): self {
        $followedUser = new self();
        $followedUser->userId = $userId;
        $followedUser->followId = $followId;
        return $followedUser;
    }

    /**
     * 保持しているUserIdを取得.
     *
     * @return UserAccountId
     */
    public function getUserId(): UserAccountId
    {
        return $this->userId;
    }

    /**
     * フォローユーザーのUserAccountIdを取得.
     *
     * @return UserAccountId
     */
    public function getFollowId(): UserAccountId
    {
        return $this->followId;
    }
}
