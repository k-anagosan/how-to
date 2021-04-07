<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TagName extends Model
{
    protected $visible = ['name'];

    protected $fillable = ['name'];

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }
}
