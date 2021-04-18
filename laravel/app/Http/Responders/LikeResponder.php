<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\PostId;
use Illuminate\Http\JsonResponse;

class LikeResponder
{
    public function response(PostId $postId): JsonResponse
    {
        return response()->json(['post_id' => $postId->toString()], JsonResponse::HTTP_OK);
    }
}
