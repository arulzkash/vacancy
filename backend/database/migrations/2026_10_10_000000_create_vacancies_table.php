<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('position', 255);
            $table->string('employment_type', 20);
            $table->unsignedInteger('candidate_count');
            $table->date('closing_date');
            $table->string('location', 255);
            $table->boolean('is_remote')->default(false);
            $table->text('description_html');
            $table->unsignedBigInteger('salary_min')->nullable();
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->boolean('show_salary')->default(false);
            $table->string('experience_level', 20);
            $table->timestamps();

            $table->index(['created_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancies');
    }
};
