<?php

namespace App\UseCase;

use App\Domain\Like\Service\LikeService;
use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\PostId;

final class LikeUseCase
{
    public function __construct(LikeService $likeService, UserService $userService)
    {
        $this->likeService = $likeService;
        $this->userService = $userService;
    }

    /**
     * @param PostId $postId
     * @return null|PostId
     */
    public function execute(PostId $postId)
    {
        $user = $this->userService->getLoginUser();

        $likedItem = $user->likePost($postId);

        return $this->likeService->putLike($likedItem);
    }
}
