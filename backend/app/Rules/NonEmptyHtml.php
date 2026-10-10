<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NonEmptyHtml implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $text = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Rich-text editors can submit empty paragraphs, nonbreaking spaces, or invisible characters.
        if (! preg_match('/[^\s\p{Z}\p{Cf}]/u', $text)) {
            $fail('The description must contain text after HTML sanitization.');
        }
    }
}
