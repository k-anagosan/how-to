<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MakeAdrCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:adr {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create new ADR classes';

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
        $name = $this->argument('name');

        $this->call('make:action', ['actionName' => $name]);
        $this->call('make:usecase', ['useCaseName' => $name]);
        $this->call('make:responder', ['responderName' => $name]);
    }
}
