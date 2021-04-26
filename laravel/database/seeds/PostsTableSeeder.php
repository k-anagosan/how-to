<?php

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $user = factory(User::class)->create();
            $tagNames = factory(TagName::class, 3)->create();
            factory(Post::class, 30)->create(['user_id' => $user->id])->each(function ($post) use ($tagNames): void {
                $tagNames->each(function ($tagName) use ($post): void {
                    factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
                });
            });
        }
    }
}
