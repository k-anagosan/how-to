<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = [
        'content',
    ];

    protected $visible = [
        'id', 'author', 'content',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id', 'id', 'users');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function getContentAttribute()
    {
        $disk = Storage::cloud();
        $path = 'contents/' . $this->attributes['filename'];
        return  $disk->exists($path) ? $disk->get($path) : '';
    }
}
