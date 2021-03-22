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

    /**
     * @return PostId
     */
    public function getId(): PostId
    {
        return $this->postId;
    }

    /**
     * @return UserAccountId
     */
    public function getUserId(): UserAccountId
    {
        return $this->userId;
    }

    /**
     * @return PostTitle
     */
    public function getTitle(): PostTitle
    {
        return $this->title;
    }

    /**
     * @return PostContent
     */
    public function getContent(): PostContent
    {
        return $this->content;
    }
}
