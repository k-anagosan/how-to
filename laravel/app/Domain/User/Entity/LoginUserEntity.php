<?php

namespace App\Domain\User\Entity;

use App\Domain\Follow\Entity\FollowEntity;
use App\Domain\Like\Entity\LikeEntity;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\UserAccountId;

class LoginUserEntity
{
    private $userId;

    private function __construct()
    {
    }

    /**
     * Service経由でのみこのインスタンスは生成される.
     *
     * @param UserAccountId $userId
     * @return self
     */
    public static function reconstructFromService(
        UserAccountId $userId
    ): self {
        $author = new self();
        $author->userId = $userId;
        return $author;
    }

    /**
     * 永続化の対象となるLikeEntityを生成する.
     *
     * @param PostId $postId
     * @return LikeEntity
     */
    public function likePost(PostId $postId): LikeEntity
    {
        return LikeEntity::createByLoginUser($postId, $this->userId);
    }

    /**
     * 永続化の対象となるFollowEntityを生成する.
     *
     * @param UserAccountId $followId
     * @return FollowEntity
     */
    public function followUser(UserAccountId $followId): FollowEntity
    {
        return FollowEntity::createByLoginUser($this->userId, $followId);
    }
}
