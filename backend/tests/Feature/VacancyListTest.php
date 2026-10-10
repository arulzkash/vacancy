<?php

namespace Tests\Feature;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancyListTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_returns_the_public_contract_with_json_types_and_dates(): void
    {
        $vacancy = Vacancy::factory()->withVisibleSalary()->create([
            'title' => 'Product Engineer — Learning Platform',
            'position' => 'Product Engineer',
            'employment_type' => EmploymentType::PartTime,
            'candidate_count' => 2,
            'closing_date' => '2026-11-09',
            'location' => 'Bandung',
            'is_remote' => true,
            'experience_level' => ExperienceLevel::FourToFiveYears,
            'description_html' => '<p>This description belongs on the detail page.</p>',
            'created_at' => '2026-10-09 02:00:00',
            'updated_at' => '2026-10-10 03:00:00',
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    [
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
                    ],
                ],
            ]);
    }

    public function test_list_orders_by_creation_time_instead_of_insertion_order(): void
    {
        $middle = Vacancy::factory()->create([
            'created_at' => '2026-10-08 02:00:00',
        ]);

        $newest = Vacancy::factory()->create([
            'created_at' => '2026-10-09 02:00:00',
        ]);

        $oldest = Vacancy::factory()->create([
            'created_at' => '2026-10-07 02:00:00',
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', $newest->id)
            ->assertJsonPath('data.1.id', $middle->id)
            ->assertJsonPath('data.2.id', $oldest->id);
    }

    public function test_equal_creation_times_are_ordered_by_id_descending(): void
    {
        $first = Vacancy::factory()->create([
            'created_at' => '2026-10-09 02:00:00',
        ]);

        $second = Vacancy::factory()->create([
            'created_at' => '2026-10-09 02:00:00',
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.id', $second->id)
            ->assertJsonPath('data.1.id', $first->id);
    }

    public function test_empty_database_returns_an_empty_data_array(): void
    {
        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_hidden_salary_is_null_even_when_amounts_are_stored(): void
    {
        $vacancy = Vacancy::factory()->withHiddenSalary()->create();

        $this->assertDatabaseHas('vacancies', [
            'id' => $vacancy->id,
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
            'show_salary' => false,
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.show_salary', false)
            ->assertJsonPath('data.0.salary_min', null)
            ->assertJsonPath('data.0.salary_max', null);
    }

    public function test_a_vacancy_without_salary_returns_null_amounts(): void
    {
        Vacancy::factory()->create();

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.salary_min', null)
            ->assertJsonPath('data.0.salary_max', null);
    }

    public function test_visible_zero_salary_is_preserved_as_a_number(): void
    {
        Vacancy::factory()->withVisibleSalary()->create([
            'salary_min' => 0,
            'salary_max' => 0,
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.show_salary', true)
            ->assertJsonPath('data.0.salary_min', 0)
            ->assertJsonPath('data.0.salary_max', 0);
    }

    public function test_company_metadata_comes_from_configuration(): void
    {
        config([
            'company.name' => 'Configured Company',
            'company.business_sector' => 'Education',
            'company.employee_range' => '100–500',
        ]);

        Vacancy::factory()->create();

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.company.name', 'Configured Company')
            ->assertJsonPath('data.0.company.business_sector', 'Education')
            ->assertJsonPath('data.0.company.employee_range', '100–500');
    }

    public function test_expired_vacancies_remain_in_the_list(): void
    {
        $vacancy = Vacancy::factory()->create([
            'closing_date' => '2020-01-01',
        ]);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $vacancy->id);
    }

    public function test_frontend_origin_can_read_the_vacancy_list(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $this->withHeader('Origin', $origin)
            ->getJson('/api/vacancies')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
