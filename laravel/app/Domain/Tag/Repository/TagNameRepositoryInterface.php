<?php

namespace App\Domain\Tag\Repository;

use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\TagNameId;

interface TagNameRepositoryInterface
{
    /**
     * TagNameストアに引数のPostTagがあればそのIDを返す。
     * 無ければ新たにそのPostTagを保存し、新規登録したIDを返す。
     *
     * @param PostTag $postTag
     *
     * @return TagNameId
     */
    public function findOrSave(PostTag $postTag): TagNameId;
}
