# ACES Election Portal — Backend API

Backend service for the ACES Election Portal, Computer Engineering Department,
Shree Vatavruksha Swami Maharaj Devasthan's Kai. Kalyanrao (Balasaheb) Ingale
Polytechnic College, Akkalkot.

Node.js + Express + TypeScript + MongoDB (Mongoose). No student login — students
vote using a single-use, cryptographically random voting token; only admins
authenticate with a username/password (JWT).

## 1. Requirements

- Node.js 18+
- A MongoDB **replica set** (required for multi-document transactions used during
  vote submission). MongoDB Atlas clusters are replica sets by default — a plain
  local `mongod` is not, unless started with `--replSet`.
- A Cloudinary account (or any S3-compatible store you adapt `src/config/cloudinary.ts` for)

## 2. Setup

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, VOTING_SESSION_SECRET, CLOUDINARY_*
```

### MongoDB Atlas
1. Create a free/shared cluster at https://cloud.mongodb.com
2. Database Access → create a user with read/write on your database
3. Network Access → allow your deployment's IP (or 0.0.0.0/0 for early testing)
4. Copy the connection string into `MONGODB_URI`

### Cloudinary
1. Create an account at https://cloudinary.com
2. Dashboard → copy Cloud Name, API Key, API Secret into `.env`

## 3. Run locally

```bash
npm run dev      # ts-node + nodemon, http://localhost:5000
```

## 4. Seed the database

```bash
npm run seed
```

This creates the six positions, one bootstrap `SUPER_ADMIN` (username from
`ADMIN_USERNAME`; if `ADMIN_PASSWORD_HASH` is empty, a random password is
generated and printed **once** to the console — save it immediately), a
`SCHEDULED` demo election, demo candidates (`isDemo: true` — replace before
production), and 10 demo voter tokens (also printed once).

To generate a real password hash yourself instead of relying on the seed script:

```bash
node -e "require('bcrypt').hash('YourStrongPassword', 12).then(console.log)"
```
Paste the result into `ADMIN_PASSWORD_HASH` in `.env`, restart, and run the seed
script again. If the configured username already exists, the seed updates its
password hash so an incorrectly configured bootstrap account can be repaired.

## 5. Election / candidate / token setup (via API, using the admin JWT)

1. `POST /api/admin/login` → get JWT
2. `POST /api/admin/election` → create the real election (name, startAt, endAt)
3. `POST /api/admin/candidates` (multipart, field `photo` optional) → add real candidates
   for each of the 6 positions
4. `POST /api/admin/tokens/generate` `{ electionId, count }` → returns the **plaintext**
   tokens once — export/distribute them to eligible students through your institution's
   chosen channel. Only a SHA-256 hash is ever stored in the database.
5. `POST /api/admin/election/start` → election goes `LIVE`
6. Students vote via `/api/voting/*` (see below)
7. `POST /api/admin/election/end` `{ electionId, password }` → requires the admin's
   own login password again, election goes `ENDED`
8. `GET /api/admin/results` → tallied results (hidden until `ENDED`)
9. `GET /api/admin/export/excel` / `GET /api/admin/export/pdf` → official reports

## 6. Build & deploy

```bash
npm run build
npm start        # runs dist/server.js
```

Recommended hosts: Render, Railway, or any Node-compatible platform. Set all
`.env.example` variables as environment variables on the host. Point
`CLIENT_URL` at your deployed frontend's origin (CORS).

```
INTERNET → Frontend (Vercel/Netlify) → Express API (Render/Railway) → MongoDB Atlas
                                                    └────────────────→ Cloudinary
```

## 7. API overview

| Area | Method & Path | Auth |
|---|---|---|
| Election info | `GET /api/elections/current` | public |
| Positions | `GET /api/positions` | public |
| Candidates (public listing, no vote counts) | `GET /api/candidates` | public |
| Validate voting token | `POST /api/voting/validate-token` | public (rate-limited) |
| Get ballot candidates | `GET /api/voting/candidates` | voting session |
| Submit ballot | `POST /api/voting/submit` | voting session (rate-limited) |
| Admin login | `POST /api/admin/login` | public (rate-limited) |
| Admin dashboard | `GET /api/admin/dashboard` | admin JWT |
| Create/start/end election | `/api/admin/election*` | admin JWT + role |
| Manage candidates | `/api/admin/candidates*` | admin JWT + role |
| Manage voter tokens | `/api/admin/tokens*` | admin JWT + role |
| Results | `GET /api/admin/results` | admin JWT (only after ENDED) |
| Publish public results | `POST /api/admin/results/publish` | admin JWT + role |
| Excel / PDF export | `GET /api/admin/export/excel`, `/pdf` | admin JWT |
| Audit log | `GET /api/admin/audit-logs` | admin JWT |

Every response follows:
```json
{ "success": true, "data": {} }
{ "success": false, "message": "..." }
```

## 8. How one-student-one-vote is enforced

- Voter tokens are stored **only as a SHA-256 hash** (`VoterToken.tokenHash`), never in plaintext.
- Token validation issues a short-lived, identity-free JWT "voting session" — it does **not** mark the token used.
- The token is only flipped to `USED` **inside the same MongoDB transaction** that creates the `Ballot` and its six `Vote` documents (see `src/services/voteService.ts`).
- A **unique compound index** `{ electionId: 1, voterTokenId: 1 }` on `Ballot` is the final backstop: even a concurrent duplicate request (double-click, multi-tab, replay) that races past the status check will be rejected by MongoDB itself with a duplicate-key error, which the service maps to `403 Already voted`.
- The frontend never determines whether a vote is valid — every check (election live, token active, all 6 positions present, candidates belong to the right position) is repeated server-side at submit time.

## 9. Tests

```bash
npm test
```
Uses `mongodb-memory-server` (spins up a real single-node replica set so
transactions work) + `supertest`. Covers invalid/used/duplicate tokens,
incomplete ballots, admin login, and end-election password verification.
(Requires outbound internet access the first time, to download the MongoDB test binary.)

## 10. Project structure

```
src/
├── config/       # env, db connection, cloudinary
├── models/       # Election, Position, Candidate, VoterToken, Ballot, Vote, Admin, AuditLog
├── middleware/    # auth (admin JWT + voting session), rate limiting, error handling
├── validators/   # Zod request schemas
├── services/     # voteService (transactional submission), resultService (tally, ties, hash)
├── exports/      # Excel (ExcelJS) and PDF (PDFKit) result reports
├── controllers/  # request handlers
├── routes/       # Express routers
├── seed/         # dev seed script
└── app.ts, server.ts
```

## 11. Security checklist implemented

Helmet, CORS restricted to `CLIENT_URL`, global + endpoint-specific rate
limiting, `express-mongo-sanitize`, Zod input validation everywhere, bcrypt
password hashing, JWT for admin only, role-based authorization middleware
(`SUPER_ADMIN` / `HOD` / `ACES_COORDINATOR`), audit logging of sensitive
actions, MongoDB transactions + unique index for vote integrity, SHA-256
result hash embedded in the PDF report for post-hoc verification, candidate
photos stored in Cloudinary (never as base64 in MongoDB), results hidden from
everyone until the election is formally `ENDED`.
