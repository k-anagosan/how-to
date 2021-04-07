<?php

namespace App\Domain\Post\Repository;

use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudContentRepository;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostFilename;
use App\Domain\ValueObject\PostId;
use Illuminate\Support\Facades\Storage;

class TestCloudContentRepository implements CloudContentRepository
{
    public function save(PostId $postId, PostContent $content): void
    {
        try {
            $disk = Storage::disk('local');
            $disk->put('test.md', $content->toString());
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function delete(PostId $postId): void
    {
        try {
            $disk = Storage::disk('local');
            $disk->delete('test.md');
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function read(PostFilename $filename): PostContent
    {
        try {
            $disk = Storage::disk('local');
            return  PostContent::create($disk->exists('test.md') ? $disk->get('test.md') : '');
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
