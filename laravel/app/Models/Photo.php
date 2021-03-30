<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
