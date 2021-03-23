<?php

namespace App\Domain\Photo\Repository;

use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface as CloudPhotoRepository;
use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostPhoto;
use Illuminate\Support\Facades\Storage;

class S3PhotoRepository implements CloudPhotoRepository
{
    public function save(PhotoId $photoId, PostPhoto $postPhoto): void
    {
        $filename = $photoId->toString() . '.' . $postPhoto->getExtension();
        Storage::cloud()->putFileAs('', $postPhoto->getPhoto(), $filename, 'public');
    }
}
