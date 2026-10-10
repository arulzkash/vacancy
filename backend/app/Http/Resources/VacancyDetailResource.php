<?php

namespace App\Http\Resources;

use App\Models\Vacancy;
use Illuminate\Http\Request;

class VacancyDetailResource extends VacancyResource
{
    public function __construct(
        Vacancy $vacancy,
        private readonly string $descriptionHtml,
    ) {
        parent::__construct($vacancy);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'description_html' => $this->descriptionHtml,
        ];
    }
}
