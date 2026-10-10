<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

class HtmlSanitizer
{
    private readonly HTMLPurifier $purifier;

    public function __construct()
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('HTML.Allowed', implode(',', [
            'p',
            'br',
            'h2',
            'h3',
            'h4',
            'strong',
            'em',
            'b',
            'i',
            'u',
            'ul',
            'ol',
            'li',
            'blockquote',
            'a[href|title]',
        ]));
        $config->set('URI.AllowedSchemes', [
            'http' => true,
            'https' => true,
        ]);

        // Keep definitions in memory instead of writing cache files into vendor.
        $config->set('Cache.DefinitionImpl', null);

        $this->purifier = new HTMLPurifier($config);
    }

    public function sanitize(string $html): string
    {
        return $this->purifier->purify($html);
    }
}
