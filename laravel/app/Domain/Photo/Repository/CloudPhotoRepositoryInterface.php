<?php

namespace App\Domain\Photo\Repository;

use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PostPhoto;

interface CloudPhotoRepositoryInterface
{
    /**
     * 画像ファイルをクラウドストレージに保存する.
     *
     * @param PhotoFilename $filename
     * @param PostPhoto     $postPhoto
     */
    public function save(PhotoFilename $filename, PostPhoto $postPhoto): void;

    /**
     * 画像ファイルをクラウドストレージから削除する.
     *
     * @param PhotoFilename $filename
     */
    public function delete(PhotoFilename $filename): void;
}
