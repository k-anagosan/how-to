<?php

namespace App\Domain\Photo\Service;

use App\Domain\Photo\Entity\PhotoEntity;
use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface as CloudPhotoRepository;
use App\Domain\Photo\Repository\PhotoRepositoryInterface as PhotoRepository;
use App\Domain\ValueObject\PhotoFilename;
use Illuminate\Support\Facades\DB;

class PhotoService
{
    private $cloudPhotoRepository;

    private $photoRepository;

    public function __construct(
        CloudPhotoRepository $cloudPhotoRepository,
        PhotoRepository $photoRepository
    ) {
        $this->cloudPhotoRepository = $cloudPhotoRepository;
        $this->photoRepository = $photoRepository;
    }

    /**
     * 与えられたPhotoEntityを永続化する.
     *
     * @param PhotoEntity $photoEntity
     */
    public function savePhoto(PhotoEntity $photoEntity): PhotoFilename
    {
        DB::beginTransaction();

        try {
            $this->cloudPhotoRepository->save($photoEntity->getFilename(), $photoEntity->getPhoto());

            $filename = $this->photoRepository->save(
                $photoEntity->getPhotoId(),
                $photoEntity->getUserId(),
                $photoEntity->getFilename()
            );
            DB::commit();
            return $filename;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->cloudPhotoRepository->delete($photoEntity->getFilename());
            throw $e;
        }
    }
}
