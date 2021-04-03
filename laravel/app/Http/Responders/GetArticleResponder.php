<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class GetArticleResponder
{
    /**
     * @param array $post
     *
     * @return JsonResponse
     */
    public function response(array $post): JsonResponse
    {
        if (count($post) === 0) {
            return abort(404);
        }
        return response()->json($post, JsonResponse::HTTP_OK);
    }
}
