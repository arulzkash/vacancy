<?php

namespace Tests\Feature;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VacancyDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_detail_returns_the_requested_vacancy_with_the_public_contract(): void
    {
        Vacancy::factory()->create(['title' => 'Another vacancy']);

        $description = '<h2>Job Description</h2><p>Build learning products.</p>';
        $vacancy = Vacancy::factory()->withVisibleSalary()->create([
            'title' => 'Product Engineer — Learning Platform',
            'position' => 'Product Engineer',
            'employment_type' => EmploymentType::PartTime,
            'candidate_count' => 2,
            'closing_date' => '2026-11-09',
            'location' => 'Bandung',
            'is_remote' => true,
            'experience_level' => ExperienceLevel::FourToFiveYears,
            'description_html' => $description,
            'created_at' => '2026-10-09 02:00:00',
            'updated_at' => '2026-10-10 03:00:00',
        ]);

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'id' => $vacancy->id,
                    'title' => 'Product Engineer — Learning Platform',
                    'position' => 'Product Engineer',
                    'company' => [
                        'name' => 'Dicoding Indonesia',
                        'business_sector' => 'Technology',
                        'employee_range' => '50–100',
                    ],
                    'employment_type' => 'part-time',
                    'candidate_count' => 2,
                    'closing_date' => '2026-11-09',
                    'location' => 'Bandung',
                    'is_remote' => true,
                    'experience_level' => '4_5',
                    'show_salary' => true,
                    'salary_min' => 5_000_000,
                    'salary_max' => 8_000_000,
                    'created_at' => '2026-10-09T02:00:00.000000Z',
                    'updated_at' => '2026-10-10T03:00:00.000000Z',
                    'description_html' => $description,
                ],
            ]);
    }

    public function test_missing_vacancy_returns_a_json_404(): void
    {
        $this->getJson('/api/vacancies/999999')
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonStructure(['message']);
    }

    #[DataProvider('invalidIdProvider')]
    public function test_invalid_ids_return_a_json_404(string $id): void
    {
        Vacancy::factory()->create();

        $this->getJson('/api/vacancies/'.$id)
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json');
    }

    public static function invalidIdProvider(): array
    {
        return [
            'text' => ['abc'],
            'negative' => ['-1'],
            'decimal' => ['1.5'],
            'zero' => ['0'],
        ];
    }

    public function test_detail_hides_salary_even_when_amounts_are_stored(): void
    {
        $vacancy = Vacancy::factory()->withHiddenSalary()->create();

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertJsonPath('data.show_salary', false)
            ->assertJsonPath('data.salary_min', null)
            ->assertJsonPath('data.salary_max', null);

        $this->assertDatabaseHas('vacancies', [
            'id' => $vacancy->id,
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
        ]);
    }

    public function test_detail_preserves_visible_zero_salary_and_nullable_amounts(): void
    {
        $vacancy = Vacancy::factory()->withVisibleSalary()->create([
            'salary_min' => 0,
            'salary_max' => 0,
        ]);

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertJsonPath('data.salary_min', 0)
            ->assertJsonPath('data.salary_max', 0);

        $withoutSalary = Vacancy::factory()->create();

        $this->getJson('/api/vacancies/'.$withoutSalary->id)
            ->assertOk()
            ->assertJsonPath('data.salary_min', null)
            ->assertJsonPath('data.salary_max', null);
    }

    public function test_detail_sanitizes_description_without_changing_the_stored_html(): void
    {
        $description = '<script>alert(1)</script>'
            .'<p onclick="alert(1)">Build <strong>products</strong>.</p>'
            .'<p><a href="javascript:alert(1)">Apply</a></p>';
        $vacancy = Vacancy::factory()->create(['description_html' => $description]);

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertJsonPath(
                'data.description_html',
                '<p>Build <strong>products</strong>.</p><p><a>Apply</a></p>',
            );

        $this->assertDatabaseHas('vacancies', [
            'id' => $vacancy->id,
            'description_html' => $description,
        ]);
    }

    public function test_list_still_excludes_description_after_reading_detail(): void
    {
        $vacancy = Vacancy::factory()->create();

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertJsonStructure(['data' => ['description_html']]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonMissingPath('data.0.description_html');
    }

    public function test_detail_keeps_expired_vacancies_accessible(): void
    {
        $vacancy = Vacancy::factory()->create(['closing_date' => '2020-01-01']);

        $this->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertJsonPath('data.id', $vacancy->id);
    }

    public function test_frontend_origin_can_read_detail_and_missing_vacancy_responses(): void
    {
        $vacancy = Vacancy::factory()->create();
        $origin = config('cors.allowed_origins')[0];

        $this->withHeader('Origin', $origin)
            ->getJson('/api/vacancies/'.$vacancy->id)
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin);

        $this->withHeader('Origin', $origin)
            ->getJson('/api/vacancies/999999')
            ->assertNotFound()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
