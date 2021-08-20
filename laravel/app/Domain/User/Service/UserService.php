<?php

namespace App\Domain\User\Service;

use App\Domain\User\Entity\LoginUserEntity;
use App\Domain\User\Entity\UserDataEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;
use Illuminate\Support\Facades\DB;

class UserService
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * ログインユーザーのIDをもとにLoginUserEntityインスタンスを作成。
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

    /**
     * 引数のユーザーIDのユーザーがログインユーザーにフォローされているかを返す.
     *
     * @param UserAccountId $userId
     * @return array
     */
    public function getFollowedByMe(UserAccountId $userId)
    {
        return $this->userRepository->getFollowedByMe($userId);
    }

    /**
     * 引数のユーザーIDのユーザーをフォローしているユーザー一覧を返す.
     *
     * @param UserAccountId $userId
     * @return array
     */
    public function getFollowers(UserAccountId $userId)
    {
        return $this->userRepository->getFollowers($userId);
    }

    /**
     * 引数のユーザー情報をUsersストアのユーザーIDのカラムに上書きする.
     */
    public function updateUserData(UserDataEntity $updatedUserData): UserAccountId
    {
        $userId = null;

        DB::beginTransaction();

        try {
            $userId = $this->userRepository->update(
                $updatedUserData->getId(),
                $updatedUserData->getUsername(),
                $updatedUserData->getEmail(),
                $updatedUserData->getPassword(),
            );

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $userId;
    }
}
