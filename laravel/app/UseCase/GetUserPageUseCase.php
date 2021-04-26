<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\AuthorService;
use App\Domain\ValueObject\Username;

final class GetUserPageUseCase
{
    private $postItemService;

    private $authorService;

    public function __construct(PostItemService $postItemService, AuthorService $authorService)
    {
        $this->postItemService = $postItemService;
        $this->authorService = $authorService;
    }

    /**
     * @param Username $username
     * @return array
     */
    public function execute(Username $username)
    {
        if (!$this->authorService->usernameExists($username)) {
            return [];
        }
        return $this->postItemService->getArticleListByUsername($username);
    }
}
