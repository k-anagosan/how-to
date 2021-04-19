<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\LikeResponder;
use App\UseCase\LikeUseCase;

class LikeAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(LikeUseCase $useCase, LikeResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(string $id)
    {
        return $this->responder->response(
            $this->useCase->execute(
                PostId::create($id)
            )
        );
    }
}
