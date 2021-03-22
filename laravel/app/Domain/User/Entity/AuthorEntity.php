<?php

namespace App\Domain\User\Entity;

use App\Domain\Post\Entity\PostItemEntity;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;

class AuthorEntity
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
     * @param PostTitle   $title
     * @param PostContent $content
     * @return PostItemEntity
     */
    public function postItem(
        PostTitle $title,
        PostContent $content
    ): PostItemEntity {
        return PostItemEntity::createByAuthor($this->userId, $title, $content);
    }
}
