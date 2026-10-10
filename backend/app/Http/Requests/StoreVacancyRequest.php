<?php

namespace App\Http\Requests;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Rules\NonEmptyHtml;
use App\Support\HtmlSanitizer;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $description = $this->input('description_html');

        if (is_string($description)) {
            $this->merge([
                'description_html' => app(HtmlSanitizer::class)->sanitize($description),
            ]);
        }

        $this->merge([
            'is_remote' => $this->input('is_remote', false),
            'show_salary' => $this->input('show_salary', false),
        ]);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        $today = CarbonImmutable::today('Asia/Jakarta')->toDateString();

        return [
            'title' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
            'candidate_count' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'closing_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.$today],
            'location' => ['required', 'string', 'max:255'],
            'is_remote' => ['required', 'boolean'],
            'description_html' => ['bail', 'required', 'string', 'max:65535', new NonEmptyHtml],
            'experience_level' => ['required', Rule::enum(ExperienceLevel::class)],
            'show_salary' => ['required', 'boolean'],
            'salary_min' => [
                'nullable',
                'required_if:show_salary,true',
                'required_with:salary_max',
                'integer',
                'min:0',
                'max:'.PHP_INT_MAX,
            ],
            'salary_max' => [
                'nullable',
                'required_if:show_salary,true',
                'required_with:salary_min',
                'integer',
                'min:0',
                'max:'.PHP_INT_MAX,
                'gte:salary_min',
            ],
        ];
    }
}
