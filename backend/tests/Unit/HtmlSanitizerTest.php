<?php

namespace Tests\Unit;

use App\Support\HtmlSanitizer;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class HtmlSanitizerTest extends TestCase
{
    public function test_it_preserves_description_formatting_and_http_links(): void
    {
        $html = '<h2>Job Description</h2>'
            .'<p>Build <strong>useful</strong> products with <em>care</em>.<br />Join us.</p>'
            .'<h3>Responsibilities</h3>'
            .'<ul><li>Write readable code.</li></ul>'
            .'<h4>Requirements</h4>'
            .'<ol><li>Understand testing.</li></ol>'
            .'<blockquote>Keep learning.</blockquote>'
            .'<p><a href="https://www.dicoding.com" title="Dicoding">Learn more</a></p>'
            .'<p><a href="http://example.com">Example</a></p>';

        $sanitizer = new HtmlSanitizer;

        $this->assertSame($html, $sanitizer->sanitize($html));
    }

    public function test_it_removes_scripts_embedded_content_and_event_handlers(): void
    {
        $html = '<script>alert(1)</script>'
            .'<iframe src="https://example.com"></iframe>'
            .'<svg onload="alert(1)"></svg>'
            .'<img src="missing" onerror="alert(1)">'
            .'<p onclick="alert(1)">Useful description.</p>';

        $sanitizer = new HtmlSanitizer;

        $this->assertSame('<p>Useful description.</p>', $sanitizer->sanitize($html));
    }

    #[DataProvider('unsafeLinkProvider')]
    public function test_it_removes_unsafe_link_urls(string $url): void
    {
        $sanitizer = new HtmlSanitizer;
        $html = '<p><a href="'.$url.'">Read more</a></p>';

        $this->assertSame('<p><a>Read more</a></p>', $sanitizer->sanitize($html));
    }

    public static function unsafeLinkProvider(): array
    {
        return [
            'javascript' => ['javascript:alert(1)'],
            'mixed case' => ['JaVaScRiPt:alert(1)'],
            'encoded scheme' => ['java&#x73;cript:alert(1)'],
            'data URL' => ['data:text/html;base64,PHNjcmlwdD4='],
        ];
    }

    public function test_it_removes_style_and_unapproved_attributes(): void
    {
        $sanitizer = new HtmlSanitizer;
        $html = '<p style="color:red" class="custom" id="custom">Hello.</p>'
            .'<a href="https://www.dicoding.com" target="_blank" onclick="alert(1)">Dicoding</a>';

        $this->assertSame(
            '<p>Hello.</p><a href="https://www.dicoding.com">Dicoding</a>',
            $sanitizer->sanitize($html),
        );
    }

    public function test_it_preserves_unicode_text_and_escaped_characters(): void
    {
        $sanitizer = new HtmlSanitizer;
        $html = '<p>Belajar café &amp; teknologi — bersama.</p>';

        $this->assertSame($html, $sanitizer->sanitize($html));
    }

    public function test_it_repairs_unclosed_formatting(): void
    {
        $sanitizer = new HtmlSanitizer;

        $this->assertSame(
            '<p>Build <strong>products</strong></p>',
            $sanitizer->sanitize('<p>Build <strong>products'),
        );
    }

    public function test_empty_input_returns_an_empty_string(): void
    {
        $sanitizer = new HtmlSanitizer;

        $this->assertSame('', $sanitizer->sanitize(''));
    }

    public function test_it_preserves_editor_code_underline_and_safe_images(): void
    {
        $html = '<p><u>Important</u> <code>&lt;script&gt;literal&lt;/script&gt;</code></p>'
            .'<pre><code>const value = 1;</code></pre>'
            .'<img src="https://example.com/team.png" alt="Our team" title="Team" />';

        $this->assertSame($html, (new HtmlSanitizer)->sanitize($html));
    }

    #[DataProvider('unsafeImageProvider')]
    public function test_it_rejects_unsafe_or_relative_image_urls(string $url): void
    {
        $html = '<p>Safe text.</p><img src="'.$url.'" alt="Image" onerror="alert(1)">';
        $this->assertSame('<p>Safe text.</p>', (new HtmlSanitizer)->sanitize($html));
    }

    public static function unsafeImageProvider(): array
    {
        return [
            'javascript' => ['javascript:alert(1)'],
            'encoded javascript' => ['java&#x73;cript:alert(1)'],
            'data' => ['data:image/svg+xml;base64,PHN2Zz4='],
            'relative' => ['/image.png'],
            'protocol relative' => ['//example.com/image.png'],
            'credentials' => ['https://user:pass@example.com/image.png'],
        ];
    }
}
