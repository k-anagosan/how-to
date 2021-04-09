<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MakeUseCaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:usecase {useCaseName}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new UseCase class';

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
        $useCaseName = $this->argument('useCaseName') . 'UseCase';

        $useCasePath = app_path() . '/UseCase/' . $useCaseName . '.php';

        if (file_exists(($useCasePath))) {
            $this->error("${useCaseName}.php already exists.");
            return;
        }

        $result = file_put_contents($useCasePath, $this->useCaseBody($useCaseName));

        if ($result !== false) {
            $this->info('UseCase created successfully.');
        } else {
            $this->error('Failed to create use case');
        }
    }

    private function useCaseBody($useCaseName)
    {
        $body = <<< EOD
        <?php

        namespace App\\UseCase;


        final class ${useCaseName}
        {
            public function __construct()
            {
                //
            }

            public function execute()
            {
                //
                
            }
        }
        EOD;

        return $body;
    }
}
