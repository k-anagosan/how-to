<?php

namespace App\Domain\User\Entity;

use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Password;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

class UserDataEntity
{
    private $userId;
    
    private $username;

    private $email;

    private $password;

    private function __construct()
    {
    }

    /**
     * LoginUserEntityによってのみこのインスタンスは生成される.
     * 
     * @param UserAccountId $userId
     * @param Username $username
     * @param Email $email
     * @param Password $password
     */
    public static function createByLoginUser(
        UserAccountId $userId,
        Username $username,
        Email $email,
        Password $password
    ){
        $userData = new self();
        $userData->userId = $userId;
        $userData->username = $username;
        $userData->email = $email;
        $userData->password = $password;
        return $userData;
    }

    /**
     * 保持しているuserIdを取得.
     *
     * @return UserAccountId
     */
    public function getId(): UserAccountId
    {
        return $this->userId;
    }

    /**
     * 保持しているUsernameを取得.
     *
     * @return Username
     */
    public function getUsername(): Username
    {
        return $this->username;
    }


    /**
     * 保持しているEmailを取得.
     *
     * @return Email
     */
    public function getEmail(): Email
    {
        return $this->email;
    }
    
    /**
     * 保持しているPasswordを取得.
     *
     * @return Password
     */
    public function getPassword(): Password
    {
        return $this->password;
    }
}