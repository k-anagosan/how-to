<?php

namespace App\Http\Actions;

use App\Http\Controllers\Controller;
use App\Http\Responders\PostResponder;
use App\UseCase\PostItemUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(PostItemUseCase $useCase, PostResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(Request $request): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute($request)
        );
    }
}
