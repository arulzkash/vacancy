<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListVacanciesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function searchKeyword(): string
    {
        return trim((string) $this->validated('search', ''));
    }
}
