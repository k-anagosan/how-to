<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\LoginUserEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;

class UserService
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * いいね操作を行ったユーザーのIDをもとにLoginUserEntityインスタンスを作成。
     *
     * @return LoginUserEntity
     */
    public function getLoginUser(): LoginUserEntity
    {
        $userId = $this->userRepository->getLogInUserId();

        return LoginUserEntity::reconstructFromService($userId);
    }
}
