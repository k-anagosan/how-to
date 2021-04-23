<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTags;
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
     * @param PostTags    $tags
     *
     * @return PostId
     */
    public function execute(
        PostTitle $title,
        PostContent $content,
        PostTags $tags
    ) {
        $author = $this->authorService->getAuthor();
        $postedItem = $author->postItem($title, $content, $tags);
        $postId = $this->postItemService->saveItem($postedItem);
        return $postId;
    }
}
