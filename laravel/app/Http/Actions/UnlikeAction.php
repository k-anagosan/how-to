<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\UnlikeResponder;
use App\UseCase\UnlikeUseCase;
use Illuminate\Http\JsonResponse;

class UnlikeAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(UnlikeUseCase $useCase, UnlikeResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(string $id): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                PostId::create($id)
            )
        );
    }
}
