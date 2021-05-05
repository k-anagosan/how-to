<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;

class GetUserPageDataResponder
{
    /**
     * @param null|array $data
     */
    public function response($data): JsonResponse
    {
        if ($data === null) {
            abort(404);
        }
        return response()->json($data, JsonResponse::HTTP_OK);
    }
}
