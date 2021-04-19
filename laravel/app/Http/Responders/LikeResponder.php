<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\PostId;
use Illuminate\Http\JsonResponse;

class LikeResponder
{
    /**
     * @param null|PostId $postId
     * @return JsonResponse
     */
    public function response($postId): JsonResponse
    {
        if ($postId === null) {
            return abort(404);
        }
        return response()->json(['post_id' => $postId->toString()], JsonResponse::HTTP_OK);
    }
}
