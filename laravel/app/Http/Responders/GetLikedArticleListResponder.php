<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class GetLikedArticleListResponder
{
    public function response(array $data): JsonResponse
    {
        if (count($data) === 0) {
            abort(404);
        }

        return response()->json($data, JsonResponse::HTTP_OK);
    }
}
