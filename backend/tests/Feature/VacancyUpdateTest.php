<?php

namespace Tests\Feature;

use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VacancyUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_frontend_can_preflight_a_json_update(): void
    {
        $origin = config('cors.allowed_origins')[0];
        $response = $this->withHeaders([
            'Origin' => $origin,
            'Access-Control-Request-Method' => 'PUT',
            'Access-Control-Request-Headers' => 'Content-Type',
        ])->options('/api/vacancies/1')
            ->assertStatus(204)
            ->assertHeader('Access-Control-Allow-Origin', $origin);
        $this->assertStringContainsString('PUT', $response->headers->get('Access-Control-Allow-Methods'));
    }

    private function payload(): array
    {
        return [
            'title' => 'Updated Backend Engineer',
            'position' => 'Backend Engineer',
            'employment_type' => 'contract',
            'candidate_count' => 3,
            'closing_date' => CarbonImmutable::today('Asia/Jakarta')->addDays(60)->toDateString(),
            'location' => 'Jakarta',
            'is_remote' => true,
            'description_html' => '<h2>Responsibilities</h2><p>Build <strong>APIs</strong>.</p>',
            'experience_level' => '4_5',
            'show_salary' => true,
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
        ];
    }

    public function test_update_changes_all_editable_fields_and_keeps_identity_and_creation_date(): void
    {
        $vacancy = Vacancy::factory()->create();
        $other = Vacancy::factory()->create();
        $before = $vacancy->refresh()->getRawOriginal();
        $otherBefore = $other->refresh()->getRawOriginal();
        $this->travel(1)->hours();
        $payload = $this->payload();

        $response = $this->putJson('/api/vacancies/'.$vacancy->id, [
            ...$payload,
            'id' => $other->id,
            'created_at' => '2000-01-01',
            'company' => ['name' => 'Untrusted company'],
        ])->assertOk()->assertJsonPath('data.id', $vacancy->id);

        foreach ($payload as $field => $value) {
            $response->assertJsonPath('data.'.$field, $value);
        }
        $vacancy->refresh();
        $this->assertSame($before['created_at'], $vacancy->getRawOriginal('created_at'));
        $this->assertNotSame($before['updated_at'], $vacancy->getRawOriginal('updated_at'));
        $this->assertSame($otherBefore, $other->fresh()->getRawOriginal());
        $this->assertDatabaseCount('vacancies', 2);
        $this->getJson('/api/vacancies/'.$vacancy->id)->assertExactJson($response->json());
        $this->getJson('/api/vacancies?search=Updated Backend')->assertJsonPath('data.0.id', $vacancy->id);
    }

    public function test_edit_response_preserves_hidden_salary_without_changing_public_responses(): void
    {
        $vacancy = Vacancy::factory()->withHiddenSalary()->create();
        $this->getJson('/api/vacancies/'.$vacancy->id.'/edit')
            ->assertOk()
            ->assertJsonPath('data.salary_min', 5_000_000)
            ->assertJsonPath('data.salary_max', 8_000_000)
            ->assertJsonPath('data.show_salary', false);
        $payload = [...$this->payload(), 'show_salary' => false];
        $this->putJson('/api/vacancies/'.$vacancy->id, $payload)
            ->assertOk()->assertJsonPath('data.salary_min', null)->assertJsonPath('data.salary_max', null);
        $this->assertDatabaseHas('vacancies', ['id' => $vacancy->id, 'salary_min' => 5_000_000, 'salary_max' => 8_000_000]);
        $this->getJson('/api/vacancies')->assertJsonPath('data.0.salary_min', null);
        $this->getJson('/api/vacancies/'.$vacancy->id)->assertJsonPath('data.salary_max', null);
    }

    public function test_update_sanitizes_rich_html_before_storing_and_rejects_empty_content(): void
    {
        $vacancy = Vacancy::factory()->create();
        $payload = $this->payload();
        $payload['description_html'] = '<h2>Build</h2><p><strong>APIs</strong></p><a href="javascript:alert(1)">Link</a><script>alert(1)</script><img src="https://example.com/team.png" onerror="alert(1)">';
        $html = $this->putJson('/api/vacancies/'.$vacancy->id, $payload)->assertOk()->json('data.description_html');
        $this->assertStringContainsString('<strong>APIs</strong>', $html);
        foreach (['javascript:', '<script>', 'onerror'] as $unsafe) {
            $this->assertStringNotContainsString($unsafe, $html);
        }
        $this->assertSame($html, $vacancy->fresh()->description_html);
        $payload['description_html'] = '<p><br></p>';
        $this->putJson('/api/vacancies/'.$vacancy->id, $payload)->assertUnprocessable()->assertJsonValidationErrors('description_html');
        $this->assertSame($html, $vacancy->fresh()->description_html);
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_update_leaves_the_entire_record_unchanged(string $field, mixed $value): void
    {
        $vacancy = Vacancy::factory()->withVisibleSalary()->create();
        $before = $vacancy->refresh()->getRawOriginal();
        $this->putJson('/api/vacancies/'.$vacancy->id, [...$this->payload(), $field => $value])
            ->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertSame($before, $vacancy->fresh()->getRawOriginal());
        $this->assertDatabaseCount('vacancies', 1);
    }

    public static function invalidFields(): array
    {
        return VacancyCreateTest::invalidFieldProvider();
    }

    public function test_missing_fields_do_not_partially_update_a_record(): void
    {
        $vacancy = Vacancy::factory()->create();
        $before = $vacancy->refresh()->getRawOriginal();
        $this->putJson('/api/vacancies/'.$vacancy->id, ['title' => 'Partial update'])
            ->assertUnprocessable()->assertJsonValidationErrors(['position', 'description_html']);
        $this->assertSame($before, $vacancy->fresh()->getRawOriginal());
    }

    public function test_optional_salary_can_be_cleared_and_incomplete_salary_payload_is_rejected(): void
    {
        $vacancy = Vacancy::factory()->withHiddenSalary()->create();
        $payload = [...$this->payload(), 'show_salary' => false, 'salary_min' => null, 'salary_max' => null];
        $this->putJson('/api/vacancies/'.$vacancy->id, $payload)->assertOk();
        $this->assertDatabaseHas('vacancies', ['id' => $vacancy->id, 'salary_min' => null, 'salary_max' => null]);
        unset($payload['salary_max']);
        $this->putJson('/api/vacancies/'.$vacancy->id, $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('salary_max');
    }

    public function test_missing_vacancy_returns_404_for_edit_and_update(): void
    {
        $this->getJson('/api/vacancies/999/edit')->assertNotFound();
        $this->putJson('/api/vacancies/999', $this->payload())->assertNotFound();
        $this->assertDatabaseCount('vacancies', 0);
    }
}
