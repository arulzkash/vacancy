<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListVacanciesRequest;
use App\Http\Requests\StoreVacancyRequest;
use App\Http\Requests\UpdateVacancyRequest;
use App\Http\Resources\VacancyDetailResource;
use App\Http\Resources\VacancyEditResource;
use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VacancyController extends Controller
{
    public function store(StoreVacancyRequest $request): JsonResponse
    {
        $vacancy = Vacancy::query()->create($request->validated());
        $vacancy->refresh();

        return (new VacancyDetailResource($vacancy, $vacancy->description_html))
            ->response()
            ->setStatusCode(201);
    }

    public function edit(Vacancy $vacancy, HtmlSanitizer $sanitizer): VacancyEditResource
    {
        return new VacancyEditResource(
            $vacancy,
            $sanitizer->sanitize($vacancy->description_html),
        );
    }

    public function update(UpdateVacancyRequest $request, Vacancy $vacancy): VacancyDetailResource
    {
        $vacancy->update($request->validated());
        $vacancy->refresh();

        return new VacancyDetailResource($vacancy, $vacancy->description_html);
    }

    public function destroy(Vacancy $vacancy): Response
    {
        $vacancy->delete();

        return response()->noContent();
    }

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
