<?php

namespace App\Domain\Tag\Entity;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\TagId;
use App\Domain\ValueObject\TagNameId;

class TagEntity
{
    private $tagId;

    private $postId;

    private $tag;

    private $tagNameId;

    private function __construct()
    {
    }

    /**
     * PostItemEntityによってのみこのインスタンスは生成される.
     *
     * @param PostId  $postId
     * @param PostTag $tag
     */
    public static function createByPostItem(
        PostId $postId,
        PostTag $tag
    ): self {
        $tagItem = new self();
        $tagItem->postId = $postId;
        $tagItem->tag = $tag;
        return $tagItem;
    }

    /**
     * 保持しているTagIdを取得する.
     *
     * @return TagId
     */
    public function getTagId(): TagId
    {
        return $this->tagId;
    }

    /**
     * 保持しているPostIdを取得する.
     *
     * @return PostId
     */
    public function getPostId(): PostId
    {
        return $this->postId;
    }

    /**
     * 保持しているPostTagを取得する.
     *
     * @return PostTag
     */
    public function getTag(): PostTag
    {
        return $this->tag;
    }

    /**
     * 保持しているTagNameIdを取得する.
     *
     * @return TagNameId
     */
    public function getTagNameId(): TagNameId
    {
        return $this->tagNameId;
    }
}
