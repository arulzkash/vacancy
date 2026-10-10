<?php

namespace App\Models;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use Database\Factories\VacancyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vacancy extends Model
{
    /** @use HasFactory<VacancyFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'title',
        'position',
        'employment_type',
        'candidate_count',
        'closing_date',
        'location',
        'is_remote',
        'description_html',
        'salary_min',
        'salary_max',
        'show_salary',
        'experience_level',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'employment_type' => EmploymentType::class,
            'candidate_count' => 'integer',
            'closing_date' => 'immutable_date',
            'is_remote' => 'boolean',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'show_salary' => 'boolean',
            'experience_level' => ExperienceLevel::class,
        ];
    }
}
