<?php

namespace Tests\Feature;

use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancyDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_removes_only_the_selected_vacancy_from_all_endpoints(): void
    {
        $vacancy = Vacancy::factory()->create();
        $other = Vacancy::factory()->create();
        $before = $other->refresh()->getRawOriginal();

        $this->deleteJson('/api/vacancies/'.$vacancy->id)->assertNoContent();

        $this->assertDatabaseMissing('vacancies', ['id' => $vacancy->id]);
        $this->assertSame($before, $other->fresh()->getRawOriginal());
        $this->getJson('/api/vacancies')->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $other->id);
        $this->getJson('/api/vacancies/'.$vacancy->id)->assertNotFound();
        $this->getJson('/api/vacancies/'.$vacancy->id.'/edit')->assertNotFound();
        $this->deleteJson('/api/vacancies/'.$vacancy->id)->assertNotFound();
    }

    public function test_missing_or_invalid_id_does_not_delete_other_vacancies(): void
    {
        Vacancy::factory()->create();
        $this->deleteJson('/api/vacancies/999')->assertNotFound();
        $this->deleteJson('/api/vacancies/invalid')->assertNotFound();
        $this->assertDatabaseCount('vacancies', 1);
    }

    public function test_cors_allows_delete_from_the_frontend(): void
    {
        $this->withHeaders([
            'Origin' => config('cors.allowed_origins')[0],
            'Access-Control-Request-Method' => 'DELETE',
            'Access-Control-Request-Headers' => 'Accept',
        ])->options('/api/vacancies/1')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
}
