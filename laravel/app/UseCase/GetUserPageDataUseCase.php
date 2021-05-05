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
        return $this->userService->getUserIdByUsername($username);
    }
}
