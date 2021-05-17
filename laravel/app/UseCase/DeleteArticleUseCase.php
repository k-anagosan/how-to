<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\PostId;

final class DeleteArticleUseCase
{
    public function __construct(PostItemService $postItemService, AuthorService $authorService)
    {
        $this->postItemService = $postItemService;
        $this->authorService = $authorService;
    }

    /**
     * @param PostId $postId
     * @return null|PostId
     */
    public function execute(PostId $postId)
    {
        if (!$this->postItemService->exists($postId)) {
            return;
        }

        $author = $this->authorService->getAuthor();
        $deletedItem = $author->deleteItem($postId);
        $this->postItemService->deleteItem($deletedItem);

        return $postId;
    }
}
