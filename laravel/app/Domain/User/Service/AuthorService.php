<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\AuthorEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;

class AuthorService
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * 投稿を行ったユーザーIDをもとにAuthorEntityインスタンスを作成。
     *
     * @return AuthorEntity
     */
    public function getAuthor(): AuthorEntity
    {
        $userId = $this->userRepository->getLogInUserId();

        return AuthorEntity::reconstructFromService($userId);
    }
}
