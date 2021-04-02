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
        try {
            Storage::cloud()->putFileAs('photos', $postPhoto->getPhoto(), $filename->toString(), 'public');
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function delete(PhotoFilename $filename): void
    {
        try {
            Storage::cloud()->delete('photos/' . $filename->toString());
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
