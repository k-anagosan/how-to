<?php

namespace App\UseCase;

use App\Domain\Post\Service\PostItemService;
use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\Username;

final class GetUserArticleListUseCase
{
    private $postItemService;

    private $userService;

    public function __construct(PostItemService $postItemService, UserService $userService)
    {
        $this->postItemService = $postItemService;
        $this->userService = $userService;
    }

    /**
     * @param Username $username
     * @return array
     */
    public function execute(Username $username)
    {
        if (!$this->userService->existsUsername($username)) {
            return [];
        }

        $data = $this->postItemService->getArticleListByUsername($username);

        return $data;
    }
}
