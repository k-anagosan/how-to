<?php

namespace App\Domain\Post\Entity;

use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;

class PostItemEntity
{
    private $postId;

    private $userId;

    private $title;

    private $content;

    private function __construct()
    {
    }

    /**
     * @param UserAccountId $userId
     * @param PostTitle     $title
     * @param PostContent   $content
     *
     * @return self
     */
    public static function createByAuthor(
        UserAccountId $userId,
        PostTitle $title,
        PostContent $content
    ): self {
        $postItem = new self();
        $postItem->postId = PostId::create();
        $postItem->userId = $userId;
        $postItem->title = $title;
        $postItem->content = $content;
        return $postItem;
    }
}
