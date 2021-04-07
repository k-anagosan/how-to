<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\TagName;
use Faker\Generator as Faker;

$factory->define(TagName::class, function (Faker $faker) {
    return [
        'name' => $faker->word,
        'created_at' => $faker->dateTime(),
        'updated_at' => $faker->dateTime(),
    ];
});
