<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\AuthorEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

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

    /**
     * 引数のUsernameからUserAccountIdを返す.
     *
     * @param Username $username
     * @return null|UserAccountId
     */
    public function getUserIdByUsername(Username $username)
    {
        return $this->userRepository->getUserIdByUsername($username);
    }
}
