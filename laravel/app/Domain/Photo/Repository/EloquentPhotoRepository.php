<?php

namespace App\Domain\Photo\Repository;

use App\Domain\Photo\Repository\PhotoRepositoryInterface as PhotoRepository;
use App\Domain\ValueObject\PhotoId;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhoto;
use App\Models\Photo;

class EloquentPhotoRepository implements PhotoRepository
{
    public function save(PhotoId $photoId, PostId $postId, PostPhoto $postPhoto): void
    {
        $photoOrm = new Photo();

        $id = $photoId->toString();

        $photoOrm->id = $id;
        $photoOrm->post_id = $postId->toString();
        $photoOrm->filename = $id . '.' . $postPhoto->getExtension();

        try {
            $photoOrm->save();
        } catch (\Exception $e) {
            throw new \Exception($e);
        }
    }
}
