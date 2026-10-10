<?php

namespace Tests\Unit;

use App\Rules\NonEmptyHtml;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class NonEmptyHtmlTest extends TestCase
{
    #[DataProvider('descriptionProvider')]
    public function test_description_requires_visible_text(string $html, bool $valid): void
    {
        $failed = false;

        (new NonEmptyHtml)->validate('description_html', $html, function () use (&$failed): void {
            $failed = true;
        });

        $this->assertSame(! $valid, $failed);
    }

    public static function descriptionProvider(): array
    {
        return [
            'empty' => ['', false],
            'empty editor paragraph' => ['<p><br /></p>', false],
            'nonbreaking spaces' => ['<p>&nbsp;&#160;</p>', false],
            'invisible characters' => ["<p>\u{200B}\u{FEFF}</p>", false],
            'whitespace' => ["<p> \n\t </p>", false],
            'formatted text' => ['<h2>Deskripsi Pekerjaan</h2><p>Build products.</p>', true],
            'encoded literal text' => ['<p>&lt;example&gt;</p>', true],
            'unicode and emoji' => ['<p>Belajar teknologi 🚀</p>', true],
        ];
    }
}
