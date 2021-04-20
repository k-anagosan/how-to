<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class GetArticleListResponder
{
    /**
     * @param array $data
     * @return JsonResponse
     */
    public function response($data): JsonResponse
    {
        if (count($data) === 0) {
            abort(404);
        }
        return response()->json($data, JsonResponse::HTTP_OK);
    }
}
