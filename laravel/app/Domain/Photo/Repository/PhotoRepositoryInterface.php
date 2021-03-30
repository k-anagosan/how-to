<?php

namespace App\Domain\Photo\Repository;

use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\UserAccountId;

interface PhotoRepositoryInterface
{
    /**
     * 引数の情報をPhotoストアに保存.
     *
     * @param PhotoId       $photoId
     * @param UserAccountId $userId
     * @param PhotoFilename $filename
     *
     * @return PhotoFilename
     */
    public function save(PhotoId $photoId, UserAccountId $userId, PhotoFilename $filename): PhotoFilename;
}
