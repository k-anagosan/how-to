<?php

namespace App\Domain\Post\Repository;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\TagNameId;
use App\Domain\ValueObject\UserAccountId;

interface PostRepositoryInterface
{
    /**
     * 引数の情報をPostストアに保存.
     *
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @param PostTitle     $title
     *
     * @return PostId
     */
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title): PostId;

    /**
     * 引数IDのレコードをPostストアから削除.
     *
     * @param PostId $postId
     */
    public function delete(PostId $postId);

    /**
     * 引数IDからPostストアを検索し記事情報を取得する.
     *
     * @param PostId $postId
     *
     * @return array
     */
    public function get(PostId $postId);

    /**
     * Postストアから記事一覧を取得する.
     *
     * @return array
     */
    public function retrieve();

    /*
    * 引数の情報をTagストアに保存.
    *
    * @param PostId   $postId
    * @param PostTags $tags
    */
    public function addTags(PostId $postId, PostTags $tags): void;

    /*
    * TagNameストアに引数のPostTagがあればそのIDを返す。
    * 無ければ新たにそのPostTagを保存し、新規登録したIDを返す。
    *
    * @param PostTag $postTag
    * @return TagNameId
    */
    public function findOrCraeteTagName(PostTag $postTag): TagNameId;

    /**
     * 引数の情報をLikesストアに保存.
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @return null|PostId
     */
    public function putLike(PostId $postId, UserAccountId $userId);

    /**
     * 引数の情報をもとにLikesストアから削除.
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @return null|PostId
     */
    public function deleteLike(PostId $postId, UserAccountId $userId);
}
