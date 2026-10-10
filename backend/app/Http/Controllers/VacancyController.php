<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListVacanciesRequest;
use App\Http\Resources\VacancyDetailResource;
use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VacancyController extends Controller
{
    public function index(ListVacanciesRequest $request): AnonymousResourceCollection
    {
        $query = Vacancy::query();
        $search = $request->searchKeyword();

        if ($search !== '') {
            // Treat LIKE wildcards and the escape character as literal title text.
            $literalSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

            $query->whereRaw("title LIKE ? ESCAPE '!'", ['%'.$literalSearch.'%']);
        }

        $vacancies = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return VacancyResource::collection($vacancies);
    }

    public function show(Vacancy $vacancy, HtmlSanitizer $sanitizer): VacancyDetailResource
    {
        $descriptionHtml = $sanitizer->sanitize($vacancy->description_html);

        return new VacancyDetailResource($vacancy, $descriptionHtml);
    }
}
