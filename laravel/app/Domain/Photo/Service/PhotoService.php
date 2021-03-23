<?php

namespace App\Domain\Photo\Service;

use App\Domain\Photo\Repository\CloudPhotoRepositoryInterface as CloudPhotoRepository;
use App\Domain\Photo\Repository\PhotoRepositoryInterface as PhotoRepository;

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
     * 与えられたPhotoEntityの配列をそれぞれ永続化していく.
     *
     * @param array $photoEntities
     */
    public function savePhotos(array $photoEntities): void
    {
        foreach ($photoEntities as $photoEntity) {
            $this->cloudPhotoRepository->save($photoEntity->getPhotoId(), $photoEntity->getPhoto());

            $this->photoRepository->save(
                $photoEntity->getPhotoId(),
                $photoEntity->getPostId(),
                $photoEntity->getPhoto()
            );
        }
    }
}
