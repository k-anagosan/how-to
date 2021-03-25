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
        $disk = Storage::disk('local');
        $filename = $postId->getFilename();

        $disk->put($filename, $content->toString());
        Storage::cloud()->putFileAs('', new File($disk->path($filename)), $filename, 'public');
        $disk->delete($filename);
    }
}
