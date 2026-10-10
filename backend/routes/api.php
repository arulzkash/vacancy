<?php

use App\Http\Controllers\VacancyController;
use Illuminate\Support\Facades\Route;

Route::get('/vacancies', [VacancyController::class, 'index']);
Route::post('/vacancies', [VacancyController::class, 'store']);
Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show'])
    ->whereNumber('vacancy');
