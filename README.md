# WHS Learning Sites

This project replaces the Google Sites pages with a single static site that can be deployed on Render.

## How it is organized

- Each program has one editable page file:
  - `DTECH/index.md`
  - `DVC/index.md`
  - `Food/index.md`
  - `Textiles/index.md`
  - `WOOD/index.md`
- Shared design and layout live in `_includes/` and `assets/`.
- Shared branding images live in `images/`.

## Staff update workflow

1. Open the program folder that needs an update.
2. Edit that folder's `index.md` file.
3. Change the text in the page body or replace placeholder links in the `quickLinks` section at the top.
4. Commit the change in GitHub.
5. Render rebuilds the site automatically.

## Local development

```bash
npm install
npm run dev
```

## Admin backend (Phase 1)

The app now includes a backend API for admin update tracking.

- `GET /api/admin/health`
- `GET /api/admin/session`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/dashboard?year=2026&term=T1`
- `GET /api/admin/courses?year=2026&term=T1&subject=DTECH&status=red`
- `POST /api/admin/courses/status`

Login payload:

```json
{
  "apiKey": "your-admin-api-key"
}
```

On successful login, the server sets an HTTP-only session cookie used by the dashboard requests.

Example payload for status updates:

```json
{
  "courseCode": "11DTECH",
  "year": 2026,
  "term": "T1",
  "outlineStatus": "complete",
  "statementStatus": "pending",
  "updatedBy": "HOD",
  "notes": "Awaiting final statement upload"
}
```

### Environment variables

Copy `.env.example` to `.env` for local use, and set these in Render for production:

- `DATABASE_URL`: Postgres connection string
- `DATABASE_SSL`: optional (`false` for local non-SSL databases)
- `ADMIN_API_KEY`: temporary admin API protection key until Google OAuth is enabled
- `ADMIN_SESSION_SECRET`: signs admin session cookies (should be different from `ADMIN_API_KEY`)

When `ADMIN_API_KEY` is set, include it in requests with header `x-admin-key`.

## Render setup

Use the repository root as the Render project.

- Build command: `npm install && npm run build`
- Publish directory: `dist`

Also set the backend env vars in Render service settings:

- `DATABASE_URL`
- `ADMIN_API_KEY`
- `ADMIN_SESSION_SECRET`
- optional `DATABASE_SSL`

If you want browser-based editing later, the next sensible step is to add a Git-backed CMS after the content structure is settled.