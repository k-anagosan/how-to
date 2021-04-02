<?php

namespace App\Domain\Photo\Repository;

use App\Domain\Photo\Repository\PhotoRepositoryInterface as PhotoRepository;
use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\UserAccountId;
use App\Models\Photo;

class EloquentPhotoRepository implements PhotoRepository
{
    public function save(PhotoId $photoId, UserAccountId $userId, PhotoFilename $filename): PhotoFilename
    {
        $photoOrm = new Photo();

        $photoOrm->id = $photoId->toString();
        $photoOrm->user_id = $userId->toInt();
        $photoOrm->filename = $filename->toString();

        try {
            $photoOrm->save();
        } catch (\Exception $e) {
            throw new \Exception($e);
        }

        return $filename;
    }
}
