<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\Tag\Service\TagService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;

final class PostItemUseCase
{
    private $authorService;

    private $postItemService;

    private $tagService;

    public function __construct(
        AuthorService $authorService,
        PostItemService $postItemService,
        TagService $tagService
    ) {
        $this->authorService = $authorService;
        $this->postItemService = $postItemService;
        $this->tagService = $tagService;
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

        $postedItem = $author->postItem($title, $content);
        $postedTags = $postedItem->postTags($tags);

        $postId = $this->postItemService->saveItem($postedItem);
        $this->tagService->saveTags($postedTags);

        return $postId;
    }
}
