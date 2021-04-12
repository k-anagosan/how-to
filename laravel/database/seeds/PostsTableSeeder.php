<?php

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use Illuminate\Database\Seeder;

class PostsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        factory(Post::class, 50)->create()->each(function ($post): void {
            factory(TagName::class, 3)->create()->each(function ($tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });
    }
}
