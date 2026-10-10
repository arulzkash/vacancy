<?php

use Symfony\Component\Process\Process;

require __DIR__.'/../vendor/autoload.php';

chdir(dirname(__DIR__));

if (! file_exists('.env') && ! copy('.env.example', '.env')) {
    throw new RuntimeException('Unable to create backend .env file.');
}

if (! file_exists('database/database.sqlite') && ! touch('database/database.sqlite')) {
    throw new RuntimeException('Unable to create development SQLite database.');
}

$commands = [['config:clear']];
$environment = file_get_contents('.env');

preg_match('/^APP_KEY=(.*)$/m', $environment, $matches);

if (trim($matches[1] ?? '', " \t\n\r\0\x0B\"'") === '') {
    $commands[] = ['key:generate'];
}

$commands[] = ['migrate', '--force'];

foreach ($commands as $arguments) {
    $process = new Process([PHP_BINARY, 'artisan', ...$arguments]);
    $process->setTimeout(120);
    $process->run(function (string $type, string $output): void {
        echo $output;
    });

    if (! $process->isSuccessful()) {
        exit($process->getExitCode() ?? 1);
    }
}
