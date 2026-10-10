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
                'description_html' => <<<'HTML'
                    <h2>Job Description</h2>
                    <p>As a Product Engineer, you will join the Product and Engineering team to build learning experiences for Dicoding users. You will turn product ideas into reliable features and help solve the problems learners face.</p>
                    <p>We are looking for an engineer who cares about both code quality and the people using the product. You will collaborate with teammates, share feedback, and keep improving how we work.</p>
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Work with designers and stakeholders to understand user needs and plan useful features.</li>
                        <li>Develop and maintain features across the front end and back end of the Dicoding platform.</li>
                        <li>Write readable code and meaningful tests, and participate in code reviews.</li>
                        <li>Investigate bugs and improve application reliability and performance.</li>
                    </ul>
                    <h2>Requirements</h2>
                    <ul>
                        <li>One to three years of experience building web applications.</li>
                        <li>Familiarity with JavaScript or TypeScript, a back-end framework, and SQL databases.</li>
                        <li>Experience using Git and working with APIs.</li>
                        <li>Clear communication, curiosity, and a willingness to learn from feedback.</li>
                    </ul>
                    HTML,
                'salary_min' => 5_000_000,
                'salary_max' => 8_000_000,
                'show_salary' => true,
            ],
            [
                'title' => 'Android Developer',
                'experience_level' => ExperienceLevel::FourToFiveYears,
                'description_html' => <<<'HTML'
                    <h2>Job Description</h2>
                    <p>As an Android Developer, you will build and improve mobile learning experiences for Dicoding students. You will work with the product team to deliver accessible, reliable Android applications.</p>
                    <p>This role involves taking features from planning through release and using feedback to improve the experience on different devices.</p>
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Develop Android features using Kotlin and the Android SDK.</li>
                        <li>Collaborate with designers and back-end engineers to integrate APIs and deliver consistent user experiences.</li>
                        <li>Write automated tests and review code with the team.</li>
                        <li>Investigate crashes, optimize performance, and support application releases.</li>
                    </ul>
                    <h2>Requirements</h2>
                    <ul>
                        <li>Four to five years of experience developing Android applications.</li>
                        <li>A good understanding of Kotlin, Android lifecycle, and Jetpack libraries.</li>
                        <li>Experience with REST APIs, asynchronous programming, and local data storage.</li>
                        <li>Familiarity with Git, testing, and collaborative development.</li>
                    </ul>
                    HTML,
                'salary_min' => 8_000_000,
                'salary_max' => 12_000_000,
                'show_salary' => false,
            ],
            [
                'title' => 'iOS Developer',
                'experience_level' => ExperienceLevel::OneToThreeYears,
                'description_html' => <<<'HTML'
                    <h2>Job Description</h2>
                    <p>As an iOS Developer, you will create mobile learning experiences for Dicoding students. You will help deliver intuitive applications that make learning easier on iPhone and iPad.</p>
                    <p>You will collaborate with the product team throughout development, from understanding requirements to releasing and improving features.</p>
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Develop and maintain iOS features using Swift.</li>
                        <li>Turn designs into accessible interfaces and integrate back-end APIs.</li>
                        <li>Write tests, participate in code reviews, and investigate application issues.</li>
                        <li>Improve performance and support releases across supported iOS versions.</li>
                    </ul>
                    <h2>Requirements</h2>
                    <ul>
                        <li>One to three years of experience developing iOS applications.</li>
                        <li>Familiarity with Swift, UIKit or SwiftUI, and the iOS application lifecycle.</li>
                        <li>Experience with API integration, asynchronous tasks, and Git.</li>
                        <li>Attention to detail and a willingness to learn with the team.</li>
                    </ul>
                    HTML,
                'salary_min' => null,
                'salary_max' => null,
                'show_salary' => false,
            ],
            [
                'title' => 'Code Reviewer',
                'experience_level' => ExperienceLevel::LessThanOneYear,
                'description_html' => <<<'HTML'
                    <h2>Job Description</h2>
                    <p>As a Code Reviewer, you will help Dicoding students improve their programming skills through constructive feedback. You will assess project submissions against course criteria and explain how students can improve their work.</p>
                    <p>This role suits an early-career developer who enjoys reading code, solving problems, and supporting other learners.</p>
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Review student submissions against the published assessment criteria.</li>
                        <li>Check application behavior, code readability, and relevant best practices.</li>
                        <li>Give specific, respectful feedback that helps students understand the next steps.</li>
                        <li>Discuss unclear cases with the education team and help maintain consistent reviews.</li>
                    </ul>
                    <h2>Requirements</h2>
                    <ul>
                        <li>Practical programming experience from personal, academic, or professional projects; less than one year of work experience is welcome.</li>
                        <li>The ability to read, run, and debug code in at least one programming language.</li>
                        <li>Familiarity with Git and an interest in software quality.</li>
                        <li>Clear written communication, attention to detail, and patience when helping learners.</li>
                    </ul>
                    HTML,
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
