<?php

namespace App\UseCase;

use App\Domain\Follow\Service\FollowService;
use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\UserAccountId;

final class UnfollowUserUseCase
{
    private $userService;

    private $followService;

    public function __construct(FollowService $followService, UserService $userService)
    {
        $this->userService = $userService;
        $this->followService = $followService;
    }

    /**
     * @param UserAccountId $unfollowId
     * @return null|UserAccountId
     */
    public function execute(UserAccountId $unfollowId)
    {
        if (!$this->userService->existsUser($unfollowId)) {
            return;
        }
        $user = $this->userService->getLoginUser();
        $unfollowedUser = $user->followUser($unfollowId);
        return $this->followService->deleteFollow($unfollowedUser);
    }
}
