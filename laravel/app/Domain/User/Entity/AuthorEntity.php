<?php

namespace App\Domain\User\Entity;

use App\Domain\ValueObject\UserAccountId;

class AuthorEntity
{
    private $userId;

    private function __construct()
    {
    }

    /**
     * Serviceクラス経由でインスタンス化を行う際に使用するメソッド.
     *
     * @param UserAccountId $userId
     * @return self
     */
    public static function reconstructFromService(
        UserAccountId $userId
    ): self {
        $author = new self();
        $author->userId = $userId;
        return $author;
    }
}
