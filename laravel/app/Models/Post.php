<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = [
        'url',
    ];

    protected $visible = [
        'id', 'author', 'url',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id', 'id', 'users');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function getUrlAttribute()
    {
        return Storage::cloud()->url($this->attributes['content']);
    }
}
