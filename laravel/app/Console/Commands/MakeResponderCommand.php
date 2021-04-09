<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MakeResponderCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:responder {responderName}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Responder class';

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
        $responderName = $this->argument('responderName') . 'Responder';

        $responderPath = app_path() . '/Http/Responders/' . $responderName . '.php';

        if (file_exists(($responderPath))) {
            $this->error("${responderName}.php already exists.");
            return;
        }

        $result = file_put_contents($responderPath, $this->responderBody($responderName));

        if ($result !== false) {
            $this->info('Responder created successfully.');
        } else {
            $this->error('Failed to create responder');
        }
    }

    private function responderBody($responderName)
    {
        $body = <<< EOD
        <?php

        namespace App\\Http\\Responders;

        use Illuminate\\Http\\JsonResponse;

        class ${responderName}
        {
            public function response(): JsonResponse
            {
                //
                
            }
        }
        EOD;

        return $body;
    }
}
