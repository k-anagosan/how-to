<?php

namespace App\Models;

use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudContentRepository;
use App\Domain\ValueObject\PostFilename;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = ['content'];

    protected $visible = [
        'id', 'title', 'author', 'content', 'tags',
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
        return resolve(CloudContentRepository::class)
            ->read(PostFilename::create($this->attributes['filename']))->toString();
    }
}
