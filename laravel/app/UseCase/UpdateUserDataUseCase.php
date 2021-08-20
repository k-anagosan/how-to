<?php

namespace App\UseCase;

use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Username;

final class UpdateUserDataUseCase
{
    private $userService;
    
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function execute(Username $name, Username $newName, Email $email, $password)
    {

        if(!$this->userService->existsUsername($name)) {
            return;
        }
        
        $loginUser = $this->userService->getLoginUser();
        $updatedData = $loginUser->editUserData($newName, $email, $password);

        $userId = $this->userService->updateUserData($updatedData);

        return $userId;
        
    }
}