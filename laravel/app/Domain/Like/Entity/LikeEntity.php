<?php

namespace App\Domain\Like\Entity;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\UserAccountId;

class LikeEntity
{
    private $postId;

    private $userId;

    private function __construct()
    {
    }

    /**
     * LoginUserEntityによってのみこのインスタンスは生成される.
     * @param PostId        $postId
     * @param UserAccountId $userId
     */
    public static function createByLoginUser(
        PostId $postId,
        UserAccountId $userId
    ): self {
        $likedItem = new self();
        $likedItem->postId = $postId;
        $likedItem->userId = $userId;
        return $likedItem;
    }

    /**
     * 保持しているPostIdを取得.
     *
     * @return PostId
     */
    public function getPostId(): PostId
    {
        return $this->postId;
    }

    /**
     * 投稿主のUserAccountIdを取得.
     *
     * @return UserAccountId
     */
    public function getUserId(): UserAccountId
    {
        return $this->userId;
    }
}
