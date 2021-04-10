<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;

final class GetArticleListUseCase
{
    private $postItemService;

    public function __construct(PostItemService $postItemService)
    {
        $this->postItemService = $postItemService;
    }

    public function execute(): array
    {
        return $this->postItemService->getArticleList();
    }
}
