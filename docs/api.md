# Vacancy API

`GET /api/vacancies` returns all vacancies in a `data` array, ordered by creation time descending, then ID descending. An empty database returns `{"data":[]}`.

The optional `search` query parameter filters by part of the title, ignoring capitalization for ASCII letters. Empty or whitespace-only keywords return all vacancies. `%`, `_`, and `!` are treated as literal characters. SQLite's default `LIKE` behavior does not perform Unicode case folding. The parameter must be a string of at most 255 characters; invalid parameters return HTTP 422 with validation errors.

Each item contains its title, position, company metadata, employment type, candidate count, closing date, location, remote flag, experience level, salary visibility, salary range, and timestamps. The `company` object includes `name`, `business_sector`, and `employee_range`, configured in `backend/config/company.php` for the single-company application. The employee range describes company size; it is separate from the vacancy's candidate count. Closing dates use `YYYY-MM-DD`; timestamps use ISO 8601 in UTC. Descriptions are excluded from the list response. When `show_salary` is `false`, `salary_min` and `salary_max` are always `null`.

`GET /api/vacancies/{id}` returns one vacancy in a `data` object with the same public fields and an additional `description_html` field. Missing IDs and nonnumeric IDs return HTTP 404. Expired vacancies remain accessible through the detail endpoint.

The detail response sanitizes description HTML with HTMLPurifier. Paragraphs, line breaks, headings (`h2`–`h4`), inline emphasis, lists, blockquotes, code, images, and absolute HTTP/HTTPS links are supported. Scripts, embedded content, event handlers, styling attributes, and unsafe or relative URLs are removed. Reading a detail does not modify the stored description or salary values.

### Creating a vacancy

`POST /api/vacancies` accepts a JSON object and returns HTTP **201** with the created vacancy in `data`, using the same fields as the detail response. Send `Content-Type: application/json` and `Accept: application/json`. Invalid input returns HTTP **422** with a `message` and an `errors` object keyed by field name, without inserting a record.

| Field | Rules |
| --- | --- |
| `title`, `position`, `location` | Required strings, up to 255 characters. Surrounding whitespace is trimmed. |
| `employment_type` | Required: `full-time`, `part-time`, `contract`, or `intern`. |
| `candidate_count` | Required integer from 1 to 4,294,967,295. |
| `closing_date` | Required valid `YYYY-MM-DD` date, today or later in Asia/Jakarta. |
| `experience_level` | Required: `less_than_1`, `1_3`, `4_5`, `6_10`, or `more_than_10`. |
| `description_html` | Required string. Sanitized before validation and storage, up to 65,535 characters after sanitization, with nonempty text. Empty editor paragraphs, whitespace, invisible characters, and markup that becomes empty after sanitization are rejected. |
| `is_remote`, `show_salary` | Optional booleans, defaulting to `false`; Laravel also accepts `0`, `1`, `"0"`, and `"1"`. |
| `salary_min`, `salary_max` | Nullable nonnegative integers within PHP's integer range. The minimum is required when `show_salary` is true or a maximum is supplied. The maximum is optional for a base salary. The maximum must be greater than or equal to the minimum. Equal amounts, including zero, are valid. |

Hidden salary amounts may be stored but remain `null` in create, list, and detail responses. Company metadata comes from backend configuration. Extra fields, including client-supplied IDs, timestamps, and company metadata, are ignored; only validated vacancy fields are stored.

To create a sample vacancy in PowerShell while the backend is running:

```powershell
$vacancyPayload = @{
    title = 'Frontend Engineer'
    position = 'Frontend Engineer'
    employment_type = 'full-time'
    candidate_count = 1
    closing_date = [TimeZoneInfo]::ConvertTimeBySystemTimeZoneId(
        [DateTime]::UtcNow, 'SE Asia Standard Time'
    ).AddDays(30).ToString('yyyy-MM-dd')
    location = 'Bandung'
    is_remote = $true
    description_html = '<h2>Deskripsi Pekerjaan</h2><p>Build accessible learning products.</p>'
    experience_level = '1_3'
    show_salary = $true
    salary_min = 5000000
    salary_max = 8000000
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
    -Uri 'http://127.0.0.1:8000/api/vacancies' `
    -ContentType 'application/json' `
    -Headers @{ Accept = 'application/json' } `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($vacancyPayload)) |
    ConvertTo-Json -Depth 5
```

This command adds a record to the local development database. The returned ID can be opened at `/vacancies/{id}` in the frontend.

To inspect the response in PowerShell while the backend is running:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/vacancies' |
    ConvertTo-Json -Depth 5
```

The description editor supports headings, bold, italic, underline, bullet and numbered lists, links, inline code, code blocks, and images from absolute HTTP(S) URLs. Select text before applying formatting or a link. Uploaded files are not supported. Descriptions must contain visible text; images alone are insufficient. The API sanitizes HTML and removes unsafe links, image sources, and event handlers.


## Update and delete

`GET /api/vacancies/{id}/edit` returns all stored form fields, including hidden salary amounts. `PUT /api/vacancies/{id}` accepts a complete form payload using the create validation rules, including nullable salary fields. It returns HTTP 200 with the updated public detail response; invalid input returns HTTP 422 without changing the record.

`DELETE /api/vacancies/{id}` permanently removes a vacancy and returns HTTP 204 with no body. Missing records return HTTP 404. These exercise endpoints have no authentication or ownership checks.
