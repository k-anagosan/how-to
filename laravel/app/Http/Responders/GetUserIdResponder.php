<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\UserAccountId;
use Illuminate\Http\JsonResponse;

class GetUserIdResponder
{
    /**
     * @param null|UserAccountId $userId
     */
    public function response($userId): JsonResponse
    {
        if ($userId === null) {
            abort(404);
        }
        return response()->json(['user_id' => $userId->toInt(), JsonResponse::HTTP_OK]);
    }
}
