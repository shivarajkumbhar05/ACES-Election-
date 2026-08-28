# ACES Election Portal — Frontend

React + Vite frontend for the ACES (Association of Computer Engineering Students) Election
Portal, built to pair with the `aces-backend` Express/MongoDB API. Covers both the student
voting flow and the admin control panel.

## Stack

- React 19 + Vite
- Tailwind CSS (custom purple/gold ACES theme)
- react-router-dom for routing
- axios for API calls
- lucide-react for icons

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend, e.g. http://localhost:5000/api
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  api/            One file per backend resource (election, positions, candidates,
                   voting, admin) — thin wrappers around axios matching the
                   { success, data } response envelope used by the backend.
  context/         AdminAuthContext (JWT persistence) and VotingContext
                    (anonymous voting-session token + in-progress ballot state).
  components/      Shared UI: buttons, cards, modals, alerts, step indicator,
                    candidate option cards, college header.
  layouts/         PublicLayout (student-facing site chrome) and
                    AdminLayout (sidebar-driven admin shell).
  pages/public/     Home → Token entry → Select candidates → Review ballot →
                    Confirmation (with audio "beep" + auto-redirect for the
                    next voter, matching a shared-kiosk voting flow).
  pages/admin/      Login, Dashboard, Manage Candidates, Voter Tokens,
                    End Election, Results.
```

## Backend contract

This frontend expects the `aces-backend` API mounted under `/api`, with routes:

- `GET  /elections/current`
- `GET  /positions`
- `GET  /candidates`                          (public, no vote counts)
- `POST /voting/validate-token`               → issues a short-lived voting session token
- `GET  /voting/candidates`                   (requires voting session)
- `POST /voting/submit`                       (requires voting session)
- `POST /admin/login`                         → JWT
- `GET  /admin/dashboard`
- `GET/POST/PUT/DELETE/PATCH /admin/candidates...`
- `POST /admin/tokens/generate|import`, `GET /admin/tokens`, `POST /admin/tokens/revoke`,
  `GET /admin/tokens/export`, `POST /admin/tokens/qr`
- `POST /admin/election`, `/admin/election/start`, `/admin/election/end`
- `GET /admin/results`, `POST /admin/results/publish`
- `GET /admin/export/excel`, `GET /admin/export/pdf`

Voting-session tokens are kept in `sessionStorage` (cleared per voter); the admin JWT is kept
in `localStorage`. Both are attached automatically by the axios interceptor in `src/api/client.js`.

## Notes

- Since voter tokens are single-use and anonymous, "Back to Select Candidates" in the
  confirmation screen returns to **token entry** (a fresh voter needs a fresh token) rather
  than replaying the previous voter's selections.
- Candidate photo uploads use `multipart/form-data` to match the backend's `multer` config.
- Excel/PDF exports are streamed as blobs and triggered as browser downloads.
