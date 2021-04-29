<?php

namespace App\Domain\Follow\Service;

use App\Domain\Follow\Entity\FollowEntity;
use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\UserAccountId;

class FollowService
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * FollowEntityをもとにユーザーをフォローする.
     *
     * @param FollowEntity $followEntity
     * @return null|UserAccountId
     */
    public function putFollow(FollowEntity $followEntity)
    {
        return $this->userRepository->putFollow($followEntity->getUserId(), $followEntity->getFollowId());
    }

    /**
     * FollowEntityをもとにフォロー解除する.
     *
     * @param FollowEntity $followEntity
     * @return null|UserAccountId
     */
    public function deleteFollow(FollowEntity $followEntity)
    {
        return $this->userRepository->deleteFollow($followEntity->getUserId(), $followEntity->getFollowId());
    }
}
