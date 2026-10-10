<?php

namespace App\Http\Requests;

class StoreVacancyRequest extends VacancyWriteRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'is_remote' => $this->input('is_remote', false),
            'show_salary' => $this->input('show_salary', false),
        ]);
    }
}
