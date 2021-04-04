<?php

namespace App\Domain\Post\Repository;

use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostFilename;
use App\Domain\ValueObject\PostId;

interface CloudContentRepositoryInterface
{
    /**
     * 記事本文をテキストファイルとしてクラウドストレージに保存する.
     *
     * @param PostId      $postId
     * @param PostContent $content
     */
    public function save(PostId $postId, PostContent $content);

    /**
     * クラウドストレージのPostIdのファイルを削除する.
     *
     * @param PostId $postId
     */
    public function delete(PostId $postId);

    /**
     * 引数で指定したクラウドストレージのファイル内容を読み込む。
     *
     * @param PostFilename $filename
     *
     * @return PostContent
     */
    public function read(PostFilename $filename);
}
