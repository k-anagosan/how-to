<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\ArchiveResponder;
use App\UseCase\ArchiveUseCase;
use Illuminate\Http\JsonResponse;

class ArchiveAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(ArchiveUseCase $useCase, ArchiveResponder $responder)
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
