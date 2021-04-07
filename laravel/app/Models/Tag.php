<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $visible = ['tagName'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function tagName()
    {
        return $this->belongsTo(TagName::class);
    }
}
