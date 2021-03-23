<?php

namespace App\Domain\Post\Entity;

use App\Domain\Photo\Entity\PhotoEntity;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhotos;
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
     * 永続化の対象となるPhotoEntityの配列を生成する.
     *
     * @param PostPhotos $photos
     * @return array
     */
    public function postPhotos(PostPhotos $photos): array
    {
        $photoEntities = [];

        if ($photos->toArray() !== null) {
            foreach ($photos->toArray() as $photo) {
                $photoEntities[] = PhotoEntity::createByPostItem($this->postId, $photo);
            }
        }

        return $photoEntities;
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
