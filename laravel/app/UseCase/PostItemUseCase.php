<?php

namespace App\UseCase;

use App\Domain\Photo\Service\PhotoService;
use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhotos;
use App\Domain\ValueObject\PostTitle;

final class PostItemUseCase
{
    private $authorService;

    private $postItemService;

    private $photoService;

    public function __construct(
        AuthorService $authorService,
        PostItemService $postItemService,
        PhotoService $photoService
    ) {
        $this->authorService = $authorService;
        $this->postItemService = $postItemService;
        $this->photoService = $photoService;
    }

    /**
     * @param PostTitle   $title
     * @param PostContent $content
     * @param PostPhotos  $photos
     *
     * @return PostId
     */
    public function execute(
        PostTitle $title,
        PostContent $content,
        PostPhotos $photos
    ) {
        $author = $this->authorService->getAuthor();

        $postedItem = $author->postItem($title, $content);
        $postedPhotos = $postedItem->postPhotos($photos);

        $this->photoService->savePhotos($postedPhotos);
        return $this->postItemService->saveItem($postedItem);
    }
}
