<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Tests\TestCase;

class EnvironmentSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_can_connect_to_sqlite(): void
    {
        $this->getJson('/up')->assertOk()->assertExactJson(['status' => 'up']);
    }

    public function test_health_endpoint_reports_failure_when_database_fails(): void
    {
        config(['app.debug' => false]);

        DB::shouldReceive('select')
            ->once()
            ->with('SELECT 1')
            ->andThrow(new RuntimeException('Database unavailable'));

        $this->getJson('/up')->assertStatus(500)->assertExactJson(['status' => 'down']);
    }

    public function test_migrations_run_in_an_isolated_in_memory_database(): void
    {
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('migrations'));
    }

    public function test_frontend_origin_can_access_health_endpoint(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $this->withHeader('Origin', $origin)->get('/up')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_unconfigured_origin_does_not_receive_cors_access(): void
    {
        $response = $this->withHeader('Origin', 'https://unconfigured.example')
            ->get('/up')->assertOk();

        $this->assertContains($response->headers->get('Access-Control-Allow-Origin'), [
            null, config('cors.allowed_origins')[0],
        ]);
    }

    public function test_api_preflight_allows_json_requests_from_frontend(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $this->withHeaders([
            'Origin' => $origin,
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'Content-Type',
        ])->options('/api/vacancies')
            ->assertStatus(204)
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
