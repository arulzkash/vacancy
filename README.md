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

The detail response sanitizes description HTML with HTMLPurifier. Paragraphs, line breaks, headings (`h2`–`h4`), inline emphasis, lists, blockquotes, and HTTP/HTTPS links are supported. Scripts, embedded content, images, event handlers, styling attributes, and unsafe link schemes are removed. Reading a detail does not modify the stored description or salary values.

To inspect the response in PowerShell while the backend is running:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/vacancies' |
    ConvertTo-Json -Depth 5
```

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

The branding and hero assets in `frontend/public/images` are local exports from the Figma vacancy list design.
