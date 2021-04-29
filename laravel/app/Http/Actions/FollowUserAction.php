<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\UserAccountId;
use App\Http\Controllers\Controller;
use App\Http\Responders\FollowUserResponder;
use App\UseCase\FollowUserUseCase;
use Illuminate\Http\JsonResponse;

class FollowUserAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(FollowUserUseCase $useCase, FollowUserResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(int $id): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                UserAccountId::create($id)
            )
        );
    }
}
