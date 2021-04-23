<?php

namespace App\Domain\Post\Entity;

use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;

class PostItemEntity
{
    private $postId;

    private $userId;

    private $title;

    private $content;

    private $tags;

    private function __construct()
    {
    }

    /**
     * AuthorEntityによってのみこのインスタンスは生成される.
     * @param UserAccountId $userId
     * @param PostTitle     $title
     * @param PostContent   $content
     * @param PostTags      $tags
     */
    public static function createByAuthor(
        UserAccountId $userId,
        PostTitle $title,
        PostContent $content,
        PostTags $tags
    ): self {
        $postItem = new self();
        $postItem->postId = PostId::create();
        $postItem->userId = $userId;
        $postItem->title = $title;
        $postItem->content = $content;
        $postItem->tags = $tags;
        return $postItem;
    }

    /**
     * 保持しているPostIdを取得.
     *
     * @return PostId
     */
    public function getId(): PostId
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

    /**
     * 保持しているPostTitleを取得.
     *
     * @return PostTitle
     */
    public function getTitle(): PostTitle
    {
        return $this->title;
    }

    /**
     * 保持しているPostContentを取得.
     *
     * @return PostContent
     */
    public function getContent(): PostContent
    {
        return $this->content;
    }

    /**
     * 保持しているPostTagsを取得.
     *
     * @return PostTags
     */
    public function getTags(): PostTags
    {
        return $this->tags;
    }
}
