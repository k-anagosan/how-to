<?php

namespace App\UseCase;

use App\Domain\Archive\Service\ArchiveService;
use App\Domain\User\Service\UserService;
use App\Domain\ValueObject\PostId;

final class ArchiveUseCase
{
    public function __construct(ArchiveService $archiveService, UserService $userService)
    {
        $this->archiveService = $archiveService;
        $this->userService = $userService;
    }

    /**
     * @param PostId $postId
     * @return null|PostId
     */
    public function execute(PostId $postId)
    {
        $user = $this->userService->getLoginUser();

        $archivedItem = $user->ArchivePost($postId);

        return $this->archiveService->putArchive($archivedItem);
    }
}
