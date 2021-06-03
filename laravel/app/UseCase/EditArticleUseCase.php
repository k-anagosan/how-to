<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;

final class EditArticleUseCase
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
     * @param PostId      $id
     * @param PostTitle   $title
     * @param PostContent $content
     * @param PostTags    $tags
     *
     * @return null|PostId
     */
    public function execute(
        PostId $id,
        PostTitle $title,
        PostContent $content,
        PostTags $tags
    ): ?PostId {
        if (!$this->postItemService->exists($id)) {
            return null;
        }

        $author = $this->authorService->getAuthor();
        $editedItem = $author->editItem($id, $title, $content, $tags);
        $editId = $this->postItemService->updateItem($editedItem);
        return $editId;
    }
}
