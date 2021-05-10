<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\UserAccountId;
use App\Http\Controllers\Controller;
use App\Http\Responders\UnfollowUserResponder;
use App\UseCase\UnfollowUserUseCase;
use Illuminate\Http\JsonResponse;

class UnfollowUserAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(UnfollowUserUseCase $useCase, UnfollowUserResponder $responder)
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
