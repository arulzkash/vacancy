<?php

namespace App\Http\Controllers;

use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VacancyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $vacancies = Vacancy::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return VacancyResource::collection($vacancies);
    }
}
