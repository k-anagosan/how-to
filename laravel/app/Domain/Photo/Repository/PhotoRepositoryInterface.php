<?php

namespace App\Domain\Photo\Repository;

use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhoto;

interface PhotoRepositoryInterface
{
    /**
     * 引数の情報をPhotoストアに保存.
     *
     * @param PhotoId   $photoId
     * @param PostId    $postId
     * @param PostPhoto $postPhoto
     */
    public function save(PhotoId $photoId, PostId $postId, PostPhoto $postPhoto): void;
}
