<?php

namespace App\UseCase;

use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\Username;

final class GetUserPageDataUseCase
{
    private $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function execute(Username $username)
    {
        $id = $this->userService->getUserIdByUsername($username);

        if ($id === null) {
            return;
        }

        return $this->userService->getFollowedByMe($id);
    }
}
