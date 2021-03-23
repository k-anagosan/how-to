<?php

namespace App\Domain\Photo\Entity;

use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhoto;

class PhotoEntity
{
    private $photoId;

    private $postId;

    private $photo;

    private function __construct()
    {
    }

    /**
     * PostItemEntityによってのみこのインスタンスは生成される.
     *
     * @param PostId    $postId
     * @param PostPhoto $photo
     *
     * @return self
     */
    public static function createByPostItem(
        PostId $postId,
        PostPhoto $photo
    ): self {
        $photoItem = new self();
        $photoItem->photoId = PhotoId::create();
        $photoItem->postId = $postId;
        $photoItem->photo = $photo;
        return $photoItem;
    }

    /**
     * 掲載先のPostIdを取得する.
     *
     * @return PostId
     */
    public function getPostId(): PostId
    {
        return $this->postId;
    }

    /**
     * 保持しているPhotoIdを取得する.
     *
     * @return PhotoId
     */
    public function getPhotoId(): PhotoId
    {
        return $this->photoId;
    }

    /**
     * 保持しているPostPhotoを取得する.
     *
     * @return PostPhoto
     */
    public function getPhoto(): PostPhoto
    {
        return $this->photo;
    }
}
