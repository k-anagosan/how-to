<?php

namespace App\UseCase;

use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\Username;

final class GetFollowerListUseCase
{
    private $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @param Username $username
     */
    public function execute(Username $username): array
    {
        $id = $this->userService->getUserIdByUsername($username);

        if ($id === null) {
            return [];
        }

        $data = $this->userService->getFollowers($id);

        return $data;
    }
}
