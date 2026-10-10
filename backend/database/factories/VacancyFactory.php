<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Vacancy> */
class VacancyFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $position = fake()->randomElement([
            'Product Engineer',
            'Android Developer',
            'iOS Developer',
            'Code Reviewer',
        ]);

        return [
            'title' => $position,
            'position' => $position,
            'employment_type' => fake()->randomElement(EmploymentType::cases()),
            'candidate_count' => fake()->numberBetween(1, 5),
            'closing_date' => CarbonImmutable::today('Asia/Jakarta')->addDays(30),
            'location' => fake()->randomElement(['Bandung', 'Jakarta', 'Yogyakarta']),
            'is_remote' => false,
            'description_html' => '<p>Help developers learn and grow through technology.</p>',
            'salary_min' => null,
            'salary_max' => null,
            'show_salary' => false,
            'experience_level' => fake()->randomElement(ExperienceLevel::cases()),
        ];
    }

    public function withVisibleSalary(): static
    {
        return $this->state([
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
            'show_salary' => true,
        ]);
    }

    public function withHiddenSalary(): static
    {
        return $this->state([
            'salary_min' => 5_000_000,
            'salary_max' => 8_000_000,
            'show_salary' => false,
        ]);
    }
}
