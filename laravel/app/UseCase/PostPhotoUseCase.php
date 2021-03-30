<?php

namespace App\UseCase;

use App\Domain\Photo\Service\PhotoService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PhotoFilename;
use App\Domain\ValueObject\PostPhoto;

final class PostPhotoUseCase
{
    private $photoService;

    private $authorService;

    public function __construct(
        AuthorService $authorService,
        PhotoService $photoService
    ) {
        $this->authorService = $authorService;
        $this->photoService = $photoService;
    }

    /**
     * @param PostPhoto $photo
     *
     * @return PhotoFilename
     */
    public function execute(
        PostPhoto $photo
    ) {
        $author = $this->authorService->getAuthor();

        $postedPhoto = $author->postPhoto($photo);

        return $this->photoService->savePhoto($postedPhoto);
    }
}
