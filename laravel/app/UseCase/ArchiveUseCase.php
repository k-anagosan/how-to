<?php

namespace App\UseCase;

use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\PostId;

final class ArchiveUseCase
{
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @param PostId $postId
     * @return null|PostId
     */
    public function execute(PostId $postId)
    {
        return $postId;
    }
}
