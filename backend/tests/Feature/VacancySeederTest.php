<?php

namespace Tests\Feature;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_list_contains_four_samples_with_dates_based_on_wib(): void
    {
        // October 10 in UTC is already October 11 in WIB.
        $this->travelTo(CarbonImmutable::parse('2026-10-10T18:30:00Z'));

        $this->seed();

        $this->assertDatabaseCount('vacancies', 4);

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.title', 'Product Engineer')
            ->assertJsonPath('data.1.title', 'Android Developer')
            ->assertJsonPath('data.2.title', 'iOS Developer')
            ->assertJsonPath('data.3.title', 'Code Reviewer')
            ->assertJsonPath('data.0.created_at', '2026-10-10T02:00:00.000000Z')
            ->assertJsonPath('data.3.created_at', '2026-10-07T02:00:00.000000Z')
            ->assertJsonPath('data.0.experience_level', '1_3')
            ->assertJsonPath('data.1.experience_level', '4_5')
            ->assertJsonPath('data.3.experience_level', 'less_than_1')
            ->assertJsonPath('data.0.salary_min', 5_000_000)
            ->assertJsonPath('data.1.salary_min', null);

        foreach (Vacancy::all() as $vacancy) {
            $this->assertSame($vacancy->title, $vacancy->position);
            $this->assertSame(EmploymentType::FullTime, $vacancy->employment_type);
            $this->assertSame(1, $vacancy->candidate_count);
            $this->assertSame('Bandung', $vacancy->location);
            $this->assertFalse($vacancy->is_remote);
            $this->assertInstanceOf(CarbonImmutable::class, $vacancy->closing_date);
            $this->assertSame('2026-11-10', $vacancy->closing_date->toDateString());
            $this->assertNotEmpty($vacancy->description_html);
        }
    }

    public function test_reseeding_preserves_existing_samples_and_other_vacancies(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-10T18:30:00Z'));
        $this->seed();

        $productEngineer = Vacancy::query()
            ->where('title', 'Product Engineer')
            ->firstOrFail();

        $productEngineer->update([
            'location' => 'Jakarta',
            'experience_level' => ExperienceLevel::SixToTenYears,
        ]);

        $existingSample = $productEngineer->getAttributes();

        $customVacancy = Vacancy::factory()->create([
            'title' => 'Backend Engineer',
            'position' => 'Backend Engineer',
        ]);

        $this->travelTo(CarbonImmutable::parse('2026-10-12T18:30:00Z'));
        $this->seed();

        $this->assertDatabaseCount('vacancies', 5);
        $this->assertSame($existingSample, $productEngineer->fresh()->getAttributes());
        $this->assertDatabaseHas('vacancies', [
            'id' => $customVacancy->id,
            'title' => 'Backend Engineer',
        ]);
    }
}
