<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\UserAccountId;
use App\Http\Controllers\Controller;
use App\Http\Responders\DeleteFollowUserResponder;
use App\UseCase\DeleteFollowUserUseCase;
use Illuminate\Http\JsonResponse;

class DeleteFollowUserAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(DeleteFollowUserUseCase $useCase, DeleteFollowUserResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(string $id): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                UserAccountId::create((int) $id)
            )
        );
    }
}
