<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\DeleteArticleResponder;
use App\UseCase\DeleteArticleUseCase;
use Illuminate\Http\JsonResponse;

class DeleteArticleAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(DeleteArticleUseCase $useCase, DeleteArticleResponder $responder)
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
