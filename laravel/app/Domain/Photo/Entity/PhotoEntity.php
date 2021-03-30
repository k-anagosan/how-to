<?php

namespace App\Domain\Photo\Entity;

use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostPhoto;
use App\Domain\ValueObject\UserAccountId;

class PhotoEntity
{
    private $photoId;

    private $filename;

    private $userId;

    private $photo;

    private function __construct()
    {
    }

    /**
     * PostItemEntityによってのみこのインスタンスは生成される.
     *
     * @param UserAccountId $userId
     * @param PostPhoto     $photo
     *
     * @return self
     */
    public static function createByAuthor(
        UserAccountId $userId,
        PostPhoto $photo
    ): self {
        $photoItem = new self();
        $photoId = PhotoId::create();
        $photoItem->photoId = $photoId;
        $photoItem->filename = PhotoFilename::create($photoId->toString() . '.' . $photo->getExtension());

        $photoItem->userId = $userId;
        $photoItem->photo = $photo;
        return $photoItem;
    }

    /**
     * 投稿主のUserAccountIdを取得する.
     *
     * @return UserAccountId
     */
    public function getUserId(): UserAccountId
    {
        return $this->userId;
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
     * 保持しているPhotoFilanameを取得する.
     *
     * @return PhotoFilename
     */
    public function getFilename(): PhotoFilename
    {
        return $this->filename;
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
