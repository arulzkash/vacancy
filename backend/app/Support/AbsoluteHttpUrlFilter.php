<?php

namespace App\Support;

use HTMLPurifier_URIFilter;

class AbsoluteHttpUrlFilter extends HTMLPurifier_URIFilter
{
    public $name = 'AbsoluteHttpUrl';

    public function filter(&$uri, $config, $context): bool
    {
        return in_array(strtolower($uri->scheme ?? ''), ['http', 'https'], true)
            && ! empty($uri->host)
            && $uri->userinfo === null;
    }
}
