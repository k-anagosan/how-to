<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class PostResponder
{
    /**
     * @param $postId
     * @return JsonResponse
     */
    public function response($postId): JsonResponse
    {
        return response()->json(['post_id' => $postId], JsonResponse::HTTP_CREATED);
    }
}
