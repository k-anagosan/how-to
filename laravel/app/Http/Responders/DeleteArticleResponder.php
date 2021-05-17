<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\PostId;
use Illuminate\Http\JsonResponse;

class DeleteArticleResponder
{
    /**
     * @param null|PostId $deletedId
     */
    public function response(?PostId $deletedId): JsonResponse
    {
        if ($deletedId === null) {
            abort(404);
        }
        return response()->json(['id' => $deletedId->toString()], JsonResponse::HTTP_OK);
    }
}
