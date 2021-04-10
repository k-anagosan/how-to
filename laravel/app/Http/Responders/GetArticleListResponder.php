<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class GetArticleListResponder
{
    public function response($data): JsonResponse
    {
        return response()->json($data, JsonResponse::HTTP_OK);
    }
}
