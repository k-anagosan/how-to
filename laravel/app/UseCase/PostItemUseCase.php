<?php

namespace App\UseCase;

use App\Domain\Photo\Service\PhotoService;
use App\Domain\Post\Service\PostItemService;
use App\Domain\Tag\Service\TagService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhotos;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;

final class PostItemUseCase
{
    private $authorService;

    private $postItemService;

    private $tagService;

    private $photoService;

    public function __construct(
        AuthorService $authorService,
        PostItemService $postItemService,
        TagService $tagService,
        PhotoService $photoService
    ) {
        $this->authorService = $authorService;
        $this->postItemService = $postItemService;
        $this->tagService = $tagService;
        $this->photoService = $photoService;
    }

    /**
     * @param PostTitle   $title
     * @param PostContent $content
     * @param PostTags    $tags
     * @param PostPhotos  $photos
     *
     * @return PostId
     */
    public function execute(
        PostTitle $title,
        PostContent $content,
        PostTags $tags,
        PostPhotos $photos
    ) {
        $author = $this->authorService->getAuthor();

        $postedItem = $author->postItem($title, $content);
        $postedTags = $postedItem->postTags($tags);
        $postedPhotos = $postedItem->postPhotos($photos);

        $this->tagService->saveTags($postedTags);
        $this->photoService->savePhotos($postedPhotos);
        return $this->postItemService->saveItem($postedItem);
    }
}
