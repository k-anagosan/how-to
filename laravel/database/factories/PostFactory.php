<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Post;
use App\Models\User;
use Faker\Generator as Faker;
use Illuminate\Support\Str;

$factory->define(Post::class, function (Faker $faker) {
    $faker->addProvider(new \DavidBadura\FakerMarkdownGenerator\FakerProvider($faker));
    $id = Str::random(20);
    return [
        'id' => $id,
        'user_id' => fn () => factory(User::class)->create()->id,
        'title' => $faker->sentence,
        'content' => $faker->markdown(),
        'created_at' => $faker->dateTime(),
        'updated_at' => $faker->dateTime(),
    ];
});
