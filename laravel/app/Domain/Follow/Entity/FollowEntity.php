<?php

namespace App\Domain\Follow\Entity;

use App\Domain\ValueObject\UserAccountId;
use App\Exceptions\FollowInvalidException;

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
     * @return self
     */
    public static function createByLoginUser(
        UserAccountId $userId,
        UserAccountId $followId
    ) {
        if ($userId->toInt() === $followId->toInt()) {
            throw new FollowInvalidException('follow_id', '自身は指定できません');
        }
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
