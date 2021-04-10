<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\TagName;
use Faker\Generator as Faker;
use Illuminate\Support\Str;

$factory->define(TagName::class, function (Faker $faker) {
    return [
        'name' => Str::random(20),
        'created_at' => $faker->dateTime(),
        'updated_at' => $faker->dateTime(),
    ];
});
