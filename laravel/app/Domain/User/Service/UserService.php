<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\LoginUserEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

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

    /**
     * 引数のユーザーネームを持つユーザーが存在するか真偽値で返す.
     * @param Username $username
     * @return bool
     */
    public function existsUsername(Username $username)
    {
        return $this->userRepository->existsUsername($username);
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
