<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\UserAccountId;
use Illuminate\Http\JsonResponse;

class DeleteFollowUserResponder
{
    /**
     * @param null|UserAccountId $userId
     * @return JsonResponse
     */
    public function response($userId): JsonResponse
    {
        if ($userId === null) {
            abort(404);
        }
        return response()->json(['user_id' => $userId->toInt()], JsonResponse::HTTP_OK);
    }
}
