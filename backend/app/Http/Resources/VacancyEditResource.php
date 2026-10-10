<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class VacancyEditResource extends VacancyDetailResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'salary_min' => $this->resource->salary_min,
            'salary_max' => $this->resource->salary_max,
        ];
    }
}
