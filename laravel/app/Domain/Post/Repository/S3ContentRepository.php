<?php

namespace App\Domain\Post\Repository;

use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudPostRepository;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

class S3ContentRepository implements CloudPostRepository
{
    public function save(PostId $postId, PostContent $content): void
    {
        $filename = $postId->getFilename();

        try {
            $disk = Storage::disk('local');
            $disk->put($filename, $content->toString());
            Storage::cloud()->putFileAs('contents', new File($disk->path($filename)), $filename, 'public');
        } catch (\Exception $e) {
            throw $e;
        } finally {
            $disk->delete($filename);
        }
    }

    public function delete(PostId $postId): void
    {
        $filename = $postId->getFilename();

        try {
            Storage::cloud()->delete('contents/' . $filename);
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
