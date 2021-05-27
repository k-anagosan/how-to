<?php

namespace App\Domain\Archive\Entity;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\UserAccountId;

class ArchiveEntity
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
        $archivedItem = new self();
        $archivedItem->postId = $postId;
        $archivedItem->userId = $userId;
        return $archivedItem;
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
