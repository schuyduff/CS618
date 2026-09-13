# CS618 — Full-Stack Web Development

Blog project for the CS618 full-stack course. This repo is the **CS618 course repo**
and currently contains **Assignment 2**: a Mongo-backed blog API plus a React
frontend that is connected to it.

> Note: this repo intentionally does **not** contain a `.devcontainer/` config.
> Development happens locally (or in a plain Codespace without a dev container);
> only the shared services are declared in `docker-compose.yml` (MongoDB).

---

## Architecture

```
┌──────────────┐   fetch (5173 → http://localhost:3000)   ┌─────────────────┐
│ React (Vite) │ ───────────────────────────────────────▶ │ Express API      │
│  :5173       │                                          │   :3000          │
└──────────────┘                                          └────────┬────────┘
                                                                   │ mongoose
                                                          ┌────────▼────────┐
                                                          │ MongoDB (mongo) │
                                                          │   :27017        │
                                                          └─────────────────┘
```

| Layer     | Tech                                | Port  |
| --------- | ----------------------------------- | ----- |
| Frontend  | React 19 + Vite + TanStack Query    | 5173  |
| Backend   | Express + Mongoose                  | 3000  |
| Database  | MongoDB 8 (Docker container)        | 27017 |

Repo layout:

- `src/` — React frontend (Vite), `src/api.js` talks to the backend
- `backend/` — Express API, Mongoose models/services/routes/tests
- `docs/` — assignment briefs and module summaries
- `docker-compose.yml` — MongoDB service only (shared infra)
- `backend/` — installs separately (own `package.json`)

---

## Prerequisites

- Node.js 20+ and npm
- Docker (to run the MongoDB container)
- MongoDB started via Docker (see below) — the backend connects to
  `mongodb://127.0.0.1:27017/cs618` by default (`MONGODB_URI` to override).

---

## Database (MongoDB via Docker Compose)

The compose file only declares the database service — there is **no dev
container**:

```bash
docker compose up -d          # starts mongodb on :27017
docker compose ps             # show the running mongodb container
docker compose down           # stop it (data persists in named volume)
```

That `mongodb` container is the one you point to in the Containers tab / where
the backend stores posts.

---

## Backend

```bash
cd backend
npm install
npm test                      # runs the service tests (node --test)
npm start                     # starts the Express API on http://localhost:3000
```

The service layer lives in `backend/services/postService.js` and its tests in
`backend/test/postService.test.js`.

API routes (`backend/routes/posts.js`):

| Method | Route          | Description                  |
| ------ | -------------- | ---------------------------- |
| GET    | `/api/posts`   | List all posts (newest first)|
| POST   | `/api/posts`   | Create a post                |
| GET    | `/api/posts/:id`| Get one post by id          |
| DELETE | `/api/posts/:id`| Delete a post by id          |

---

## Frontend

```bash
npm install
npm run dev                   # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in your browser. The homepage loads posts from the
backend (`src/api.js` → `http://localhost:3000/api/posts`) and the "Create a
post" form POSTs to the same API, so a newly created post appears immediately on
the homepage.

---

## Running tests

Assignment 2 requires at least one passing service test:

```bash
cd backend
npm test        # node --test → postService tests
```

---

## Assignment 2 checklist

- [x] Model blog post data in Mongoose (`backend/models/Post.js`)
- [x] Service layer: `createPost`, `listPosts`, `getPost`, `deletePost`
      (`backend/services/postService.js`)
- [x] At least one service test (`backend/test/postService.test.js`)
- [x] REST API routes (`backend/routes/posts.js`, mounted in `backend/server.js`)
- [x] Frontend connected to backend (create → appears on homepage immediately)

See `docs/assignment2_brief.md` for the full rubric.

---

## Assignment 3 — Cloud deploy + user system

**CI/CD is the assignment.** Two hand-written Dockerfiles (rubric: "created using
a Dockerfile, not a one-liner") are version-controlled in this repo, CI runs on
every push, and CD deploys both services to **Google Cloud Run (`us-central1`)**
whenever `main` gets a new commit — so the grader's browser hits a *real, live*
Cloud Run URL, not a screenshot.

### What's in the repo (all rubric-satisfying files)

| File | What it provides |
|---|---|
| `Dockerfile` (repo root) | **Frontend** image — multi-stage: Vite build → nginx serving the SPA (works the `/api` proxy env mechanism Cloud Run honors) |
| `backend/Dockerfile` | **Backend** image — Node 22, Express+Mongoose, listens on `:3000` |
| `docker-compose.yml` | Local parity: `mongo` + `backend` + `frontend`, matching the 3 Cloud Run pieces 1:1 |
| `nginx.conf.template` | Frontend SPA fallback + `/api` → backend proxy (the editable runtime template Cloud Run serves) |
| `.github/workflows/ci.yml` | **CI**: backend tests (vs Mongo service container), frontend lint + build, both Docker images build — on every push/PR |
| `.github/workflows/cd.yml` | **CD**: build+push both images → **Docker Hub `schuyduff/*`** → deploy backend + frontend to **Cloud Run `us-central1`** on `main` |

### The user system (A3's new "auth" requirement)

- **Backend**: `User` model (bcrypt-hashed password), `userService`
  (`registerUser`/`loginUser` issuing JWTs), `requireAuth`/`optionalAuth`
  middleware, `routes/users.js` (`/api/users/signup`, `/api/users/login`).
  Every `POST /api/posts` is now gated behind a logged-in user.
- **Frontend**: `AuthContext` (token in `localStorage`, Bearer header via
  `api.js`), `Signup`/`Login` pages, `CreatePost` gated behind login, 401 →
  redirect home with the session cleared.
- Signup → login → create post → the new post appears on the homepage
  immediately (same store, listed newest-first).

### Env vars the backend reads (verified in committed code)

| Env var | Read in | Fallback | Required? |
|---|---|---|---|
| `MONGODB_URI` | `server.js:10` | `mongodb://127.0.0.1:27017/cs618` | **Yes** — Cloud Run CD sets it from the `ATLAS_URI` secret |
| `JWT_SECRET` | `middleware/auth.js:3` | `cs618-dev-secret` | Yes (set a real one) |
| `JWT_EXPIRES_IN` | `userService.js:6` | `"7d"` | No (default fine) |
| `PORT` | `server.js:11` | `3000` | No (Cloud Run injects) |

The frontend service instead gets `BACKEND_URL` (CD sets it from the `BACKEND_URL`
secret) — don't put `MONGODB_URI` there.

### GitHub secrets CI/CD needs (set once, repo → Settings → Secrets → Actions)

`DOCKERHUB_USERNAME` · `DOCKERHUB_TOKEN` · `ATLAS_URI` · `JWT_SECRET` ·
`GCP_SA_JSON` (GCP service-account key) · `BACKEND_URL`. Full walkthrough in
**`docs/assignment3_brief.md`**.

---

## Docs

- `docs/assignment2_brief.md` — Assignment 2 brief / rubric
- `docs/initial_project_brief.md` — Project 1 initial brief
- `docs/module_4_summary.md` — Module 4 summary
