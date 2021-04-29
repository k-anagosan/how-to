<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\LoginUserEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;

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

    /**
     * 引数のユーザーIDを持つユーザーが存在するか真偽値で返す.
     * @param UserAccountId $userId
     * @return bool
     */
    public function existsUser(UserAccountId $userId)
    {
        return $this->userRepository->exists($userId);
    }
}
