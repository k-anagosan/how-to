<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\ValueObject\PostId;

final class GetArticleUseCase
{
    private $postItemService;

    public function __construct(
        PostItemService $postItemService
    ) {
        $this->postItemService = $postItemService;
    }

    /**
     * @param PostId $id
     *
     * @return array
     */
    public function execute(
        PostId $id
    ) {
        return $this->postItemService->getArticle($id);
    }
}
