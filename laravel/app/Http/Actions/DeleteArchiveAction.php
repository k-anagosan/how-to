<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\DeleteArchiveResponder;
use App\UseCase\DeleteArchiveUseCase;
use Illuminate\Http\JsonResponse;

class DeleteArchiveAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(DeleteArchiveUseCase $useCase, DeleteArchiveResponder $responder)
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
