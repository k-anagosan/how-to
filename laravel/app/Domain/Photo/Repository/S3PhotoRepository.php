<?php

namespace App\Domain\Photo\Repository;

use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface as CloudPhotoRepository;
use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PostPhoto;
use Illuminate\Support\Facades\Storage;

class S3PhotoRepository implements CloudPhotoRepository
{
    public function save(PhotoFilename $filename, PostPhoto $postPhoto): void
    {
        Storage::cloud()->putFileAs('', $postPhoto->getPhoto(), $filename->toString(), 'public');
    }
}
