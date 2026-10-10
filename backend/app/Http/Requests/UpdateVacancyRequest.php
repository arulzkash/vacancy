<?php

namespace App\Http\Requests;

class UpdateVacancyRequest extends VacancyWriteRequest
{
    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        $rules = parent::rules();

        // PUT replaces the editable fields; omitted salaries must not retain old values.
        $rules['salary_min'] = ['present', ...$rules['salary_min']];
        $rules['salary_max'] = ['present', ...$rules['salary_max']];

        return $rules;
    }
}
