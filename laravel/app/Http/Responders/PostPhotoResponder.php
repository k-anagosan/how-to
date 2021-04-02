<?php

namespace App\Http\Responders;

use App\Domain\ValueObject\PhotoFilename;
use Illuminate\Http\JsonResponse;

class PostPhotoResponder
{
    /**
     * @param PhotoFilename $filename
     * @return JsonResponse
     */
    public function response(PhotoFilename $filename): JsonResponse
    {
        return response()->json(['filename' => $filename->toString()], JsonResponse::HTTP_CREATED);
    }
}
