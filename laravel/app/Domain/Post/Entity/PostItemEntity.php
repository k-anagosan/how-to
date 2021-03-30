<?php

namespace App\Domain\Post\Entity;

use App\Domain\Tag\Entity\TagEntity;
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

    private function __construct()
    {
    }

    /**
     * AuthorEntityによってのみこのインスタンスは生成される.
     * @param UserAccountId $userId
     * @param PostTitle     $title
     * @param PostContent   $content
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

    /**
     * 永続化の対象となるPhotoTagの配列を生成する.
     *
     * @param PostTags $tags
     * @return array
     */
    public function postTags(PostTags $tags): array
    {
        $tagEntities = [];

        if ($tags->toArray() !== null) {
            foreach ($tags->toArray() as $tag) {
                $tagEntities[] = TagEntity::createByPostItem($this->postId, $tag);
            }
        }
        return $tagEntities;
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
}
