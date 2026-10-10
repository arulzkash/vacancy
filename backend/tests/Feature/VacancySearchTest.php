<?php

namespace Tests\Feature;

use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancySearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_matches_part_of_the_title_and_keeps_newest_first(): void
    {
        $older = Vacancy::factory()->create([
            'title' => 'Android Developer',
            'created_at' => '2026-10-08 02:00:00',
        ]);
        $newer = Vacancy::factory()->create([
            'title' => 'iOS Developer',
            'created_at' => '2026-10-09 02:00:00',
        ]);
        Vacancy::factory()->create(['title' => 'Product Engineer']);

        $this->getJson('/api/vacancies?search=Develop')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id);
    }

    public function test_search_ignores_capitalization_and_surrounding_spaces(): void
    {
        $vacancy = Vacancy::factory()->create(['title' => 'Android Developer']);

        $this->getJson('/api/vacancies?'.http_build_query(['search' => '  aNdRoId  ']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $vacancy->id);
    }

    public function test_search_only_matches_titles(): void
    {
        Vacancy::factory()->create([
            'title' => 'Product Engineer',
            'position' => 'Android Developer',
            'location' => 'Android City',
            'description_html' => '<p>Android experience required.</p>',
        ]);

        $this->getJson('/api/vacancies?search=Android')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_no_match_returns_an_empty_data_array(): void
    {
        Vacancy::factory()->create(['title' => 'Product Engineer']);

        $this->getJson('/api/vacancies?search=Designer')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_empty_and_whitespace_keywords_return_all_vacancies(): void
    {
        Vacancy::factory()->count(2)->create();

        foreach (['', '   '] as $search) {
            $this->getJson('/api/vacancies?'.http_build_query(['search' => $search]))
                ->assertOk()
                ->assertJsonCount(2, 'data');
        }
    }

    public function test_percent_underscore_and_escape_characters_are_literal(): void
    {
        $percent = Vacancy::factory()->create(['title' => '100% Product Engineer']);
        $underscore = Vacancy::factory()->create(['title' => 'Android_Developer']);
        $exclamation = Vacancy::factory()->create(['title' => 'Engineer!']);
        Vacancy::factory()->create(['title' => 'Android Developer']);

        $expectedMatches = [
            '%' => $percent->id,
            '_' => $underscore->id,
            '!' => $exclamation->id,
        ];

        foreach ($expectedMatches as $search => $id) {
            $this->getJson('/api/vacancies?'.http_build_query(['search' => $search]))
                ->assertOk()
                ->assertJsonCount(1, 'data')
                ->assertJsonPath('data.0.id', $id);
        }
    }

    public function test_quotes_are_search_text_instead_of_sql(): void
    {
        $vacancy = Vacancy::factory()->create(['title' => "Engineer's Assistant"]);

        $this->getJson('/api/vacancies?'.http_build_query(['search' => "Engineer's"]))
            ->assertOk()
            ->assertJsonPath('data.0.id', $vacancy->id);

        $this->getJson('/api/vacancies?'.http_build_query(['search' => "' OR 1=1 --"]))
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_search_rejects_arrays_and_keywords_longer_than_255_characters(): void
    {
        foreach ([['Developer'], str_repeat('a', 256)] as $search) {
            $this->getJson('/api/vacancies?'.http_build_query(['search' => $search]))
                ->assertUnprocessable()
                ->assertJsonValidationErrors('search');
        }
    }

    public function test_search_preserves_salary_privacy(): void
    {
        Vacancy::factory()->withHiddenSalary()->create(['title' => 'Android Developer']);

        $this->getJson('/api/vacancies?search=Android')
            ->assertOk()
            ->assertJsonPath('data.0.show_salary', false)
            ->assertJsonPath('data.0.salary_min', null)
            ->assertJsonPath('data.0.salary_max', null);
    }
}
