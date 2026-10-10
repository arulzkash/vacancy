# Dicoding Jobs

A Laravel 13 API and a Next.js 16 frontend for the Dicoding Product Engineer Intern technical test. The application uses SQLite, TypeScript, Tailwind CSS, and TanStack Query.

## Requirements

- PHP 8.3 or later with the extensions required by Laravel, including `pdo_sqlite` and `sqlite3`.
- Composer 2.
- Node.js 22 and npm.

## Installation

Clone the repository and open its root directory:

```sh
git clone https://github.com/arulzkash/vacancy.git
cd vacancy
```

Install and configure the backend:

```sh
cd backend
composer install
composer run setup
php artisan db:seed
```

The setup command creates `.env`, an application key, and the development SQLite database when needed, then runs migrations. Running it again preserves existing environment settings, the application key, and database contents.

The seed command adds four sample vacancies. Running it again preserves existing records and does not duplicate the samples.

In a second terminal, open the repository root and install the frontend:

```sh
cd frontend
npm ci
npm run setup
```

The frontend setup command creates `.env.local` from `.env.example` if it does not already exist.

## Running locally

From `backend`:

```sh
composer run dev
```

From `frontend`, in a separate terminal:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [the application](http://127.0.0.1:3000). The backend runs at `http://127.0.0.1:8000`; its [health endpoint](http://127.0.0.1:8000/up) checks the application and database connection. Stop either server with `Ctrl+C`.

The homepage redirects to `/vacancies`, where vacancy cards are loaded from the Laravel API. The list includes loading, empty, and error states with a retry button. Dates are displayed in Indonesian using the Asia/Jakarta timezone.

Use the search field to find part of a vacancy title. Searches run 300 ms after typing stops; pressing Enter searches immediately. Surrounding spaces are trimmed, and clearing the field restores the complete list. The keyword is stored as `search` in the URL, so `/vacancies?search=Developer` can be opened directly or shared. Searches replace the current history entry without reloading or scrolling the page.

Click a vacancy card to open `/vacancies/{id}`. The detail page loads its description and metadata from the API, including experience and candidate count. The back link restores the search keyword. Detail pages include a loading skeleton, a not-found message, and retry for request failures. Description lengths depend on the database content; the sample records contain brief descriptions.

Open **Dashboard** in the navigation to manage the vacancy list at `/dashboard`, then use **Buat lowongan** to open `/vacancies/create`. The dashboard currently shows all vacancies because authentication and recruiter ownership are not implemented. Use **Edit** on a dashboard card to open `/vacancies/{id}/edit`. Delete controls remain disabled until that feature becomes available. Fill in the title, position, employment type, candidate count, closing date, location, description, and experience level. Position and location provide native combobox suggestions and also accept custom text. The form requires a minimum salary. The maximum is optional for a base salary. Use the salary visibility switch to control whether candidates can see it. Enter the active-until date as DD/MM/YYYY or use the calendar button; the API receives YYYY-MM-DD. The description starts with an editable rich-text template.

The form uses React Hook Form and a TanStack Query mutation. While the request is pending, fields and the submit button are disabled. Validation errors appear beside their fields, and failed requests preserve the current input. A successful submission invalidates all list queries and redirects to `/vacancies?created=1` with an empty search and a success message. Cancelling creation returns to the dashboard. Descriptions are edited with Tiptap and submitted as HTML.

Editing loads every stored field, including rich-text content and salaries hidden from candidates. Saving replaces the editable fields, refreshes the list and detail caches, and returns to `/dashboard?updated=1` with a success message. Failed saves keep the entered values and show field errors. Closing dates follow the same rule as creation: today or later in Asia/Jakarta. Cancelling returns to the dashboard without saving.

The edit form uses `GET /api/vacancies/{id}/edit`, and updates use `PUT /api/vacancies/{id}` with a complete form payload (nullable salaries must still be present). Public list/detail responses keep hidden salaries as `null`. Authentication and ownership checks are outside the current scope; the edit endpoint is currently accessible under the same unauthenticated model as creation.

## Configuration

| File | Variable | Default |
| --- | --- | --- |
| `backend/.env` | `DB_CONNECTION` | `sqlite` |
| `backend/.env` | `FRONTEND_URL` | `http://127.0.0.1:3000` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000` |

Use the same hostname consistently. If you change the frontend address, update `FRONTEND_URL` to match its origin. The API base URL is the backend origin without `/api`. Restart the servers after changing environment files.

Local environment files and SQLite databases are excluded from Git. The setup command creates `backend/database/database.sqlite` using the committed migrations.

## Vacancy API

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

## Tests and checks

Run backend tests and checks from `backend`:

```sh
composer test
composer run lint
composer validate --no-check-publish
```

Run frontend checks from `frontend`:

```sh
npm run lint
npm run typecheck
npm run build
```

### Browser tests

On Windows, Playwright automatically uses Chrome or Edge when installed. If neither browser is available, or on other platforms, install Chromium from `frontend`:

```sh
npx playwright install chromium --no-shell
```

Then run:

```sh
npm run test:e2e
```

The browser suite checks the homepage redirect, four seeded vacancy cards in API order, card metadata, Indonesian dates, mobile overflow, loading and empty states, and recovery from network and server errors. It also checks the backend health endpoint and verifies that the development database stays unchanged during the tests.

The list and retry recovery use the actual Laravel API. Empty and error scenarios intercept browser requests without changing database records. Loading and retry checks hold requests until their pending states have been verified, rather than relying on fixed delays.

Search tests cover the 300 ms debounce, trimming and capitalization, clearing the keyword, direct URLs and reloads, empty results, Enter submission, retry, and cancellation of an older request when a newer search starts. The debounce test controls browser time; the other search flows use the actual API.

Detail tests cover the complete list → search → card → detail → back flow with the actual API, browser back, direct URLs and reloads, company metadata, description content, loading, missing and invalid IDs, network/server errors with retry, mobile overflow, and footer spacing for short descriptions. Loading requests are held until the pending state is checked. A rich-text scenario intercepts the detail response to verify headings, emphasis, lists, and links without changing stored records; HTML sanitization is covered by the backend tests.

Create tests submit the complete form to the actual API, verify dashboard and public-list cache refresh, then search for and open the new vacancy. Rich-text tests verify formatting saved through the API and rendered on detail, URL validation, toolbar actions, and formatting retained after a failed submission. Create tests also cover escaped description text, required-field and salary validation, field-level HTTP 422 errors, network/server failures, prevention of duplicate submissions, and mobile overflow. An automatic fixture removes only the IDs created by each test from `backend/database/e2e.sqlite`, preserving the four seeded samples and the development database.

Dashboard tests cover API-backed cards, dates and order, disabled edit/delete controls, navigation and cancellation, loading, empty and error states with retry, direct URLs, reloads, and mobile overflow.

Playwright starts its own backend on port **8001** and frontend on port **3001**. These ports must be available. The regular development servers can remain running on ports 8000 and 3000.

Use `npm run test:e2e:ui` for interactive tests or `npx playwright show-report` to open the HTML report.

To select an installed browser explicitly in PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome' # or 'msedge'
npm run test:e2e
```

Run `Remove-Item Env:PLAYWRIGHT_CHANNEL` to restore automatic browser selection. If PHP is not available on PATH, set `PHP_BINARY` to the PHP executable path.

### Test databases

| Environment | Database |
| --- | --- |
| Local development | `backend/database/database.sqlite` |
| PHPUnit | SQLite `:memory:` |
| Playwright | `backend/database/e2e.sqlite` |

PHPUnit runs migrations in memory. Playwright resets and seeds its dedicated database before starting the test server and uses a separate frontend build directory, `.next-e2e`.

If Laravel configuration has been cached, clear it from `backend` before running browser tests:

```sh
php artisan config:clear
```

## Project structure

```text
backend/                         Laravel API, migrations, and PHPUnit tests
frontend/src/app/                Next.js pages and layouts
frontend/src/components/         Shared layout and icon components
frontend/src/features/vacancies/  Vacancy types, API client, query, and UI
frontend/src/lib/                API configuration and date formatting
frontend/tests/e2e/              Playwright browser tests
frontend/scripts/                Setup and browser test server scripts
```

Design reference: [Dicoding Figma](https://www.figma.com/design/JnDQ3lIhN37Mv4630lFKKq/Dicoding?node-id=0-1).

The branding, hero, and dashboard Jobs banner in `frontend/public/images` are local assets derived from the Figma designs.
