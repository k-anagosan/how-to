<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTitle;

final class PostItemUseCase
{
    private $authorService;

    private $postItemService;

    public function __construct(
        AuthorService $authorService,
        PostItemService $postItemService
    ) {
        $this->authorService = $authorService;
        $this->postItemService = $postItemService;
    }

    /**
     * @param PostTitle   $title
     * @param PostContent $content
     *
     * @return PostId
     */
    public function execute(
        PostTitle $title,
        PostContent $content
    ): PostId {
        $author = $this->authorService->getAuthor();
        $postedItem = $author->postItem($title, $content);
        return $this->postItemService->saveItem($postedItem);
    }
}
