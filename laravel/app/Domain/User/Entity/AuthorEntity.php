<?php

namespace App\Domain\User\Entity;

use App\Domain\Photo\Entity\PhotoEntity;
use App\Domain\Post\Entity\PostItemEntity;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostPhoto;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;

class AuthorEntity
{
    private $userId;

    private function __construct()
    {
    }

    /**
     * Service経由でのみこのインスタンスは生成される.
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

    /**
     * 投稿予定のPostItemEntityインスタンスを生成する.
     *
     * @param PostTitle   $title
     * @param PostContent $content
     * @param PostTags    $tags
     * @return PostItemEntity
     */
    public function postItem(
        PostTitle $title,
        PostContent $content,
        PostTags $tags
    ): PostItemEntity {
        return PostItemEntity::createByAuthor($this->userId, null, $title, $content, $tags);
    }

    /**
     * 編集予定のPostItemEntityインスタンスを生成する.
     *
     * @param PostId      $id
     * @param PostTitle   $title
     * @param PostContent $content
     * @param PostTags    $tags
     * @return PostItemEntity
     */
    public function editItem(
        PostId $id,
        PostTitle $title,
        PostContent $content,
        PostTags $tags
    ): PostItemEntity {
        return PostItemEntity::createByAuthor($this->userId, $id, $title, $content, $tags);
    }

    /**
     * 削除予定のPostItemEntityインスタンスを生成する.
     * @param PostId $postId
     * @return PostItemEntity
     */
    public function deleteItem(PostId $postId)
    {
        return PostItemEntity::createByAuthor($this->userId, $postId, null, null, null);
    }

    /**
     * 永続化の対象となるPhotoEntityを生成する.
     *
     * @param PostPhoto $photo
     * @return array
     */
    public function postPhoto(PostPhoto $photo): PhotoEntity
    {
        return PhotoEntity::createByAuthor($this->userId, $photo);
    }
}
