<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Post;
use App\Models\User;
use Faker\Generator as Faker;
use Illuminate\Support\Str;

$factory->define(Post::class, function (Faker $faker) {
    $id = Str::random(20);
    return [
        'id' => $id,
        'user_id' => fn () => factory(User::class)->create()->id,
        'title' => $faker->sentence,
        'content' => $faker->text(2000),
        'created_at' => $faker->dateTime(),
        'updated_at' => $faker->dateTime(),
    ];
});
