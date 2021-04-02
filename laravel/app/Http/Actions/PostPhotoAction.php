<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostPhoto;
use App\Http\Controllers\Controller;
use App\Http\Requests\PostPhotoRequest;
use App\Http\Responders\PostPhotoResponder;
use App\UseCase\PostPhotoUseCase;
use Illuminate\Http\JsonResponse;

class PostPhotoAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(PostPhotoUseCase $useCase, PostPhotoResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(PostPhotoRequest $request): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                PostPhoto::create($request->file('photo'))
            )
        );
    }
}
