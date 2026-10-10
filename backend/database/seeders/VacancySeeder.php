<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class VacancySeeder extends Seeder
{
    public function run(): void
    {
        $today = CarbonImmutable::today('Asia/Jakarta');

        $vacancies = [
            [
                'title' => 'Product Engineer',
                'experience_level' => ExperienceLevel::OneToThreeYears,
                'description_html' => '<p>Build and improve the Dicoding learning platform.</p>',
                'salary_min' => 5_000_000,
                'salary_max' => 8_000_000,
                'show_salary' => true,
            ],
            [
                'title' => 'Android Developer',
                'experience_level' => ExperienceLevel::FourToFiveYears,
                'description_html' => '<p>Develop Android learning experiences for Dicoding students.</p>',
                'salary_min' => 8_000_000,
                'salary_max' => 12_000_000,
                'show_salary' => false,
            ],
            [
                'title' => 'iOS Developer',
                'experience_level' => ExperienceLevel::OneToThreeYears,
                'description_html' => '<p>Create iOS learning experiences for Dicoding students.</p>',
                'salary_min' => null,
                'salary_max' => null,
                'show_salary' => false,
            ],
            [
                'title' => 'Code Reviewer',
                'experience_level' => ExperienceLevel::LessThanOneYear,
                'description_html' => '<p>Review student submissions and provide useful feedback.</p>',
                'salary_min' => null,
                'salary_max' => null,
                'show_salary' => false,
            ],
        ];

        foreach ($vacancies as $index => $vacancy) {
            // Store publication timestamps in UTC; closing dates stay calendar dates in WIB.
            $createdAt = $today->subDays($index + 1)->setTime(9, 0)->utc();

            Vacancy::query()->firstOrCreate(
                [
                    'title' => $vacancy['title'],
                    'position' => $vacancy['title'],
                ],
                array_merge($vacancy, [
                    'employment_type' => EmploymentType::FullTime,
                    'candidate_count' => 1,
                    'closing_date' => $today->addDays(30)->toDateString(),
                    'location' => 'Bandung',
                    'is_remote' => false,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]),
            );
        }
    }
}
