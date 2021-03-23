<?php

namespace App\Domain\Photo\Repository;

use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostPhoto;

interface CloudPhotoRepositoryInterface
{
    /**
     * 画像ファイルをクラウドストレージに保存する.
     *
     * @param PhotoId   $photoId
     * @param PostPhoto $postPhoto
     */
    public function save(PhotoId $photoId, PostPhoto $postPhoto): void;
}
