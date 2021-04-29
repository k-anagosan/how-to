<?php

namespace App\UseCase;

use App\Domain\Follow\Service\FollowService;
use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\UserAccountId;

final class FollowUserUseCase
{
    private $userService;

    private $followService;

    public function __construct(FollowService $followService, UserService $userService)
    {
        $this->userService = $userService;
        $this->followService = $followService;
    }

    /**
     * @param UserAccountId $followId
     * @return null|UserAccountId
     */
    public function execute(UserAccountId $followId)
    {
        if (!$this->userService->existsUser($followId)) {
            return;
        }
        $user = $this->userService->getLoginUser();
        $followedUser = $user->followUser($followId);
        return $this->followService->putFollow($followedUser);
    }
}
