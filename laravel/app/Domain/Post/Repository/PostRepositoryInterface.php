<?php

namespace App\Domain\Post\Repository;

use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\TagNameId;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;

interface PostRepositoryInterface
{
    /**
     * 引数の情報をPostストアに保存.
     *
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @param PostTitle     $title
     * @param PostContent   $content
     *
     * @return PostId
     */
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title, PostContent $content): PostId;

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

    /**
     * ユーザーネームをもとに記事一覧を取得.
     * @param Username $username
     * @return array
     */
    public function retrieveByUsername(Username $username);

    /**
     * ユーザーがいいねした記事一覧を取得.
     * @param UserAccountId $userId
     * @return array
     */
    public function retrieveLikedArticles(UserAccountId $userId);

    /**
     * ユーザーがアーカイブした記事一覧を取得.
     * @param UserAccountId $userId
     * @return array
     */
    public function retrieveArchivedArticles(UserAccountId $userId);

    /*
    * 引数の情報をTagストアに保存.
    *
    * @param PostId   $postId
    * @param PostTags $tags
    */
    public function addTags(PostId $postId, PostTags $tags): void;

    /*
    * 引数の記事IDに付加されているタグを削除.
    *
    * @param PostId   $postId
    */
    public function deleteTags(PostId $postId): void;

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

    /**
     * 引数の情報をArchivesストアに保存.
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @return null|PostId
     */
    public function putArchive(PostId $postId, UserAccountId $userId);

    /**
     * 引数の情報をもとにArchivesストアから削除.
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @return null|PostId
     */
    public function deleteArchive(PostId $postId, UserAccountId $userId);

    /**
     * 記事に付加されているいいねをLikesストアからすべて削除する.
     * @param PostId $postId
     * @return null|PostId
     */
    public function clearLike(PostId $postId);

    /**
     * 指定した記事IDが存在するか真偽値で返す.
     * @param PostId $postId
     * @return bool
     */
    public function exists(PostId $postId);

    /*
     * 指定したユーザーが指定した記事の著者であるか真偽値で返す.
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @return bool
     */
    public function isOwned(PostId $postId, UserAccountId $userId);
}
