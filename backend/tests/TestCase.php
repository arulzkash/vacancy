<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use LogicException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $application = parent::createApplication();

        if ($application['config']->get('database.default') !== 'sqlite'
            || $application['config']->get('database.connections.sqlite.database') !== ':memory:') {
            throw new LogicException('PHPUnit requires SQLite :memory:. Clear cached Laravel configuration before testing.');
        }

        return $application;
    }
}
