<?php

namespace App\Http\Resources;

use App\Models\Vacancy;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacancyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        /** @var Vacancy $vacancy */
        $vacancy = $this->resource;

        return [
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'position' => $vacancy->position,
            'company' => [
                'name' => config('company.name'),
            ],
            'employment_type' => $vacancy->employment_type->value,
            'candidate_count' => $vacancy->candidate_count,
            'closing_date' => $vacancy->closing_date->toDateString(),
            'location' => $vacancy->location,
            'is_remote' => $vacancy->is_remote,
            'experience_level' => $vacancy->experience_level->value,
            'show_salary' => $vacancy->show_salary,
            'salary_min' => $vacancy->show_salary ? $vacancy->salary_min : null,
            'salary_max' => $vacancy->show_salary ? $vacancy->salary_max : null,
            'created_at' => $vacancy->created_at->toISOString(),
            'updated_at' => $vacancy->updated_at->toISOString(),
        ];
    }
}
