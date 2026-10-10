<?php

use App\Http\Controllers\VacancyController;
use Illuminate\Support\Facades\Route;

Route::get('/vacancies', [VacancyController::class, 'index']);
Route::post('/vacancies', [VacancyController::class, 'store']);
Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show'])
    ->whereNumber('vacancy');

Route::get('/vacancies/{vacancy}/edit', [VacancyController::class, 'edit'])
    ->whereNumber('vacancy');
Route::put('/vacancies/{vacancy}', [VacancyController::class, 'update'])
    ->whereNumber('vacancy');

Route::delete('/vacancies/{vacancy}', [VacancyController::class, 'destroy'])
    ->whereNumber('vacancy');
