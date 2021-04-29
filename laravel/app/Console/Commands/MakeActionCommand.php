<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MakeActionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:action {actionName}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Action class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Create a new Action Class file.
     */
    public function handle(): void
    {
        $actionName = $this->argument('actionName') . 'Action';

        $actionPath = app_path() . '/Http/Actions/' . $actionName . '.php';

        if (file_exists(($actionPath))) {
            $this->error("${actionName}.php already exists.");
            return;
        }

        $result = file_put_contents($actionPath, $this->actionBody($actionName));

        if ($result !== false) {
            $this->info('Action created successfully.');
        } else {
            $this->error('Failed to create Action');
        }
    }

    private function actionBody($actionName)
    {
        $body = <<< EOD
        <?php

        namespace App\\Http\\Actions;

        use App\\Http\\Controllers\\Controller;
        use Illuminate\\Http\\JsonResponse;

        class ${actionName} extends Controller
        {
            private \$useCase;

            private \$responder;
            
            public function __construct(\$useCase, \$responder)
            {
                \$this->useCase = \$useCase;
                \$this->responder = \$responder;
            }

            public function __invoke(): JsonResponse
            {
                return \$this->responder->response(
                    \$this->useCase->execute(
                        //
                    )
                );
            }
        }
        EOD;

        return $body;
    }
}
