<?php

namespace Tests\Feature;

use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VacancyCreateTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        return [
            'title' => 'Product Engineer — Learning Platform',
            'position' => 'Product Engineer',
            'employment_type' => 'full-time',
            'candidate_count' => 2,
            'closing_date' => CarbonImmutable::today('Asia/Jakarta')->addDays(30)->toDateString(),
            'location' => 'Bandung',
            'is_remote' => true,
            'description_html' => '<h2>Deskripsi Pekerjaan</h2><p>Build <strong>learning products</strong>.</p>',
            'experience_level' => '1_3',
            'show_salary' => true,
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
        ];
    }

    public function test_valid_payload_is_created_and_available_through_list_and_detail(): void
    {
        $payload = $this->validPayload();
        $response = $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', $payload['title'])
            ->assertJsonPath('data.position', $payload['position'])
            ->assertJsonPath('data.closing_date', $payload['closing_date'])
            ->assertJsonPath('data.description_html', $payload['description_html'])
            ->assertJsonPath('data.candidate_count', 2)
            ->assertJsonPath('data.is_remote', true)
            ->assertJsonPath('data.salary_min', 5_000_000)
            ->assertJsonPath('data.salary_max', 8_000_000)
            ->assertJsonPath('data.company.business_sector', 'Technology');

        $id = $response->json('data.id');
        $this->assertDatabaseCount('vacancies', 1);
        $storedAttributes = $payload;
        unset($storedAttributes['closing_date']);
        $this->assertDatabaseHas('vacancies', ['id' => $id, ...$storedAttributes]);
        // Eloquent serializes dates with a time in SQLite; compare the calendar date through its cast.
        $this->assertSame($payload['closing_date'], Vacancy::findOrFail($id)->closing_date->toDateString());
        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.id', $id)
            ->assertJsonMissingPath('data.0.description_html');
        $this->getJson('/api/vacancies/'.$id)
            ->assertOk()
            ->assertExactJson($response->json());
    }

    #[DataProvider('requiredFieldProvider')]
    public function test_missing_required_fields_do_not_save_data(string $field): void
    {
        $payload = $this->validPayload();
        unset($payload[$field]);

        $this->postJson('/api/vacancies', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);
        $this->assertDatabaseCount('vacancies', 0);
    }

    public static function requiredFieldProvider(): array
    {
        return array_map(fn (string $field) => [$field], [
            'title', 'position', 'employment_type', 'candidate_count',
            'closing_date', 'location', 'description_html', 'experience_level',
            'salary_min', 'salary_max',
        ]);
    }

    #[DataProvider('invalidFieldProvider')]
    public function test_invalid_fields_return_errors_without_changing_existing_data(string $field, mixed $value): void
    {
        $existing = Vacancy::factory()->create();
        $payload = array_replace($this->validPayload(), [$field => $value]);

        $this->postJson('/api/vacancies', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);
        $this->assertDatabaseCount('vacancies', 1);
        $this->assertDatabaseHas('vacancies', ['id' => $existing->id, 'title' => $existing->title]);
    }

    public static function invalidFieldProvider(): array
    {
        return [
            'blank title' => ['title', '   '],
            'long title' => ['title', str_repeat('a', 256)],
            'title array' => ['title', ['title']],
            'blank position' => ['position', ''],
            'long position' => ['position', str_repeat('a', 256)],
            'blank location' => ['location', ''],
            'long location' => ['location', str_repeat('a', 256)],
            'zero candidates' => ['candidate_count', 0],
            'negative candidates' => ['candidate_count', -1],
            'fractional candidates' => ['candidate_count', 1.5],
            'oversized candidate count' => ['candidate_count', 4_294_967_296],
            'past closing date' => ['closing_date', '2020-01-01'],
            'invalid calendar date' => ['closing_date', '2026-02-30'],
            'date with time' => ['closing_date', '2030-01-01T12:00:00Z'],
            'invalid employment type' => ['employment_type', 'freelance'],
            'invalid experience' => ['experience_level', 'senior'],
            'invalid remote flag' => ['is_remote', 'yes'],
            'invalid salary flag' => ['show_salary', 'yes'],
            'negative salary' => ['salary_min', -1],
            'fractional salary' => ['salary_min', 1.5],
            'maximum below minimum' => ['salary_max', 4_000_000],
            'blank description' => ['description_html', ''],
            'description array' => ['description_html', ['content']],
            'long description' => ['description_html', str_repeat('a', 65_536)],
            'script-only description' => ['description_html', '<script>alert(1)</script>'],
            'image-only description' => ['description_html', '<img src="x" onerror="alert(1)">'],
            'empty editor content' => ['description_html', '<p><br></p>'],
            'nonbreaking-space description' => ['description_html', '<p>&nbsp;</p>'],
            'invisible description' => ['description_html', "<p>\u{200B}</p>"],
        ];
    }

    public function test_all_empty_required_fields_return_individual_errors(): void
    {
        $payload = array_fill_keys([
            'title', 'position', 'employment_type', 'candidate_count',
            'closing_date', 'location', 'description_html', 'experience_level',
        ], '');

        $this->postJson('/api/vacancies', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(array_keys($payload));
        $this->assertDatabaseCount('vacancies', 0);
    }

    public function test_defaults_allow_creation_without_salary_or_optional_flags(): void
    {
        $payload = $this->validPayload();
        unset($payload['is_remote'], $payload['show_salary'], $payload['salary_min'], $payload['salary_max']);

        $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.is_remote', false)
            ->assertJsonPath('data.show_salary', false)
            ->assertJsonPath('data.salary_min', null)
            ->assertJsonPath('data.salary_max', null);
        $this->assertDatabaseCount('vacancies', 1);
    }

    public function test_hidden_salary_can_be_stored_but_is_never_exposed(): void
    {
        $payload = array_replace($this->validPayload(), ['show_salary' => false]);
        $response = $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.salary_min', null)
            ->assertJsonPath('data.salary_max', null);
        $id = $response->json('data.id');

        $this->assertDatabaseHas('vacancies', ['id' => $id, 'salary_min' => 5_000_000, 'salary_max' => 8_000_000]);
        $this->getJson('/api/vacancies')->assertJsonPath('data.0.salary_min', null);
        $this->getJson('/api/vacancies/'.$id)->assertJsonPath('data.salary_max', null);
    }

    public function test_salary_range_requires_both_amounts_even_when_hidden(): void
    {
        foreach (['salary_min', 'salary_max'] as $field) {
            $payload = array_replace($this->validPayload(), ['show_salary' => false]);
            unset($payload[$field]);

            $this->postJson('/api/vacancies', $payload)
                ->assertUnprocessable()
                ->assertJsonValidationErrors($field);
        }

        $this->assertDatabaseCount('vacancies', 0);
    }

    public function test_visible_equal_zero_salary_is_valid(): void
    {
        $payload = array_replace($this->validPayload(), ['salary_min' => 0, 'salary_max' => 0]);

        $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.salary_min', 0)
            ->assertJsonPath('data.salary_max', 0);
    }

    public function test_closing_date_uses_today_in_wib_at_the_utc_date_boundary(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-09 18:30:00', 'UTC'));

        $this->postJson('/api/vacancies', array_replace($this->validPayload(), ['closing_date' => '2026-10-09']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('closing_date');
        $this->assertDatabaseCount('vacancies', 0);

        $this->postJson('/api/vacancies', array_replace($this->validPayload(), ['closing_date' => '2026-10-10']))
            ->assertCreated()
            ->assertJsonPath('data.closing_date', '2026-10-10');
    }

    public function test_dangerous_html_is_removed_before_storage_and_response(): void
    {
        $payload = array_replace($this->validPayload(), [
            'description_html' => '<script>alert(1)</script><p onclick="alert(1)">Build <strong>products</strong>.</p>'
                .'<iframe src="https://example.com"></iframe><img src="x" onerror="alert(1)">'
                .'<p><a href="javascript:alert(1)">Apply</a></p>',
        ]);
        $sanitized = '<p>Build <strong>products</strong>.</p><p><a>Apply</a></p>';

        $response = $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.description_html', $sanitized);
        $id = $response->json('data.id');

        $this->assertDatabaseHas('vacancies', ['id' => $id, 'description_html' => $sanitized]);
        $this->getJson('/api/vacancies/'.$id)->assertJsonPath('data.description_html', $sanitized);
    }

    public function test_only_validated_fields_are_stored(): void
    {
        $payload = array_replace($this->validPayload(), [
            'id' => 999999,
            'created_at' => '2000-01-01 00:00:00',
            'company' => ['name' => 'Untrusted Company'],
        ]);

        $response = $this->postJson('/api/vacancies', $payload)
            ->assertCreated()
            ->assertJsonPath('data.company.name', 'Dicoding Indonesia');

        $this->assertNotSame(999999, $response->json('data.id'));
        $this->assertNotSame('2000-01-01T00:00:00.000000Z', $response->json('data.created_at'));
    }

    public function test_frontend_origin_can_create_a_vacancy_and_read_validation_errors(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $this->withHeader('Origin', $origin)->postJson('/api/vacancies', $this->validPayload())
            ->assertCreated()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
        $this->withHeader('Origin', $origin)->postJson('/api/vacancies', [])
            ->assertUnprocessable()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
