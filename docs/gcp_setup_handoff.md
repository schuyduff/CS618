# CS618 A3 — GCP + external-account handoff (grader-verified, step-by-step)

Repo `main` is **already fully configured** to deploy the moment these five secrets exist.
Scripts/CI/CD are committed and pushed; **none of this is code you must write** — it's account
creation + pasting credentials into the right GitHub secret. Work through the boxes in order
(1 → 2 → 3 → 4) and push once at the end; `cd.yml` does the rest (Docker Hub push + Cloud Run).

> **What you need up front (all free tiers):** Docker Hub account, MongoDB Atlas account,
> Google account. Budget ≈ $0. No local gcloud install required — everything below is web-UI + one `gh` command.

---

## 0. Checklist — by the time you're done you'll have pasted 6 things

| # | Secret name (GitHub) | You get it from | What it is |
|---|---|---|---|
| 1 | `DOCKERHUB_USERNAME` | Docker Hub | your username |
| 2 | `DOCKERHUB_TOKEN` | Docker Hub → Account settings → Security | a **token**, NOT your password |
| 3 | `ATLAS_URI` | Atlas | `mongodb+srv://<user>:<pass>@<cluster>…/?retryWrites=true&w=majority` |
| 4 | `JWT_SECRET` | you type it | any long random string (e.g. `openssl rand -hex 32`) |
| 5 | `GCP_SA_JSON` | GCP (step 3703) | the **entire contents** of a service-account JSON key file |
| 6 | `BACKEND_URL` | Cloud Run (step 4) | your deployed backend's `https://…-run.app` |


## 1. Docker Hub (feeds secrets `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN`)

1. Sign up at <https://hub.docker.com> (free). Username → this becomes `DOCKERHUB_USERNAME`. **Use exactly `schuyduff`** so the image names in `cd.yml` match (it pushes `schuyduff/cs618-backend`, `schuyduff/cs618-frontend`).
2. Create the two repos the workflow tags against. Top-right **Create repository**:
   - `cs618-backend` (visibility: Public)
   - `cs618-frontend` (visibility: Public)
3. Generate a **token**: avatar → **Account Settings → Security → New Access Token** → give it a name (`github-actions`) at read/write scope **→ Copy the token now** (it's shown once).
4. That token → secret `DOCKERHUB_TOKEN`. (Kept out of the repo, only in GitHub.)

## 2. MongoDB Atlas (feeds secret `ATLAS_URI`)

1. Create a free account at <https://www.mongodb.com/cloud/atlas> then **Build a Database** → choose **M0 Free** (shared) cluster.
2. Under **Database Access** → **Add New Database User**:
   - username + password you choose; keep note of both (they go INSIDE the URI below).
3. Under **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`) so Cloud Run can reach it. (Cloud Run IPs aren't fixed; wildcard is the standard A3 answer.)
4. Cluster → **Connect → Drivers** → choose **Node.js** → copy the connection string, e.g.
   `mongodb+srv://<dbUser>:<dbPassword>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
5. **Replace `<dbUser>:<dbPassword>`** with the real user/password, then paste that full URI into secret `ATLAS_URI`.

## 3. Google Cloud Platform (feeds secrets `GCP_SA_JSON` + your project id for the region)

1. **Create a project** at <https://console.cloud.google.com/projectcreate> (name e.g. `cs618`). Note the **Project ID** (globally unique, auto-suggested) — it may look like `cs618-427512`. This is the project your service account must belong to.
2. **Enable the required APIs** (top search bar → will show "Enable" button):
   - **Cloud Run API**
   - **Artifact Registry API**
3. **Create a service account**:
   - console → **IAM & Admin → Service Accounts → Create service account**
   - Name: `github-actions` → **Create and continue**
   - **Grant this service account access**: add role **Cloud Run Admin** → **Done**.
4. **Add the deployer role** on the *project* (needed for `iam.serviceAccounts.actAs`):
   - IAM → your `github-actions` account → **Edit** → **Add another role → Cloud Run Admin (roles/run.admin) → Save**. (The `deploy-cloudrun` action also needs `roles/iam.serviceAccountUser`; Cloud Run Admin on the project grants the run side, and actAs is typically auto-satisfied when the SA deploys as itself.)
5. **Create a JSON key** for the service account:
   - Service Accounts list → your account → **…(three dots) → Manage keys → Add key → Create new key → JSON → Create**
   - A JSON file downloads automatically. **Do not rename/mangle it.**
6. **The ENTIRE JSON file contents** → secret `GCP_SA_JSON`. (cd.yml auths GCP solely from this.)

## 4. One-time couple of minutes of console back-and-forth (feeds secret `BACKEND_URL`)

1. **Push `main` once** (after secrets 1–5 are set). The CI step on push will build+push Docker images and `cd.yml` will deploy backend **and** frontend to Cloud Run automatically. See step 5 for what that's triggered by.
2. Open **Cloud Run** in console → you'll see `cs618-backend` and `cs618-frontend`. Click `cs618-backend` → its URL is `https://cs618-backend-<hash>-uc.a.run.app`.
3. Put that URL → secret `BACKEND_URL` so the frontend knows where the API lives.

---

## 5. Putting the secrets in GitHub (the actual "setup" moment)

Each of the five secrets above is added the same way — repo → **Settings → Secrets and variables → Actions → New repository secret**:

```bash
# Try all at once (only works if you have the `gh` CLI, which is the standard way):
#   gh secret set DOCKERHUB_USERNAME
#   gh secret set DOCKERHUB_TOKEN
#   gh secret set ATLAS_URI
#   gh secret set JWT_SECRET
#   gh secret set GCP_SA_JSON
# Run each one: it prompts you to type the value (paste), then Enter.
gh secret list   # afterwards, sanity check every name shows up
```

> If you don't have `gh`: paste each value through the web UI at Settings → Secrets → New repository secret — same names, same location.

**Generating the `JWT_SECRET`:**
```bash
openssl rand -hex 32   # → e.g. 9f2c1a…  paste the output as the secret value
```

---

## 6. Push main → watch the pipeline

```bash
git add -A && git commit -m "A3: configure deployment secrets (Docker Hub, Atlas, GCP service account)"
git push origin main
```

Then in GitHub → **Actions** tab:
- **CI** runs (backend tests against a Mongo service container, frontend lint+build, docker image builds).
- **CD** (on `main`) pushes both images to Docker Hub (`schuyduff/cs618-backend`, `schuyduff/cs618-frontend`) and deploys the two Cloud Run services in `us-central1`.

Check the **frontend Cloud Run URL** → **Sign up** → **Log in** → **Create post** → it appears on the homepage. That's the A3 demo loop, live.

---

## 7. Handoff evidence (what to show the grader — already committed/pushed)

- `docs/assignment3_brief.md` — post model, auth-flow write-up, test screenshot, live-URL pointers.
- `.github/workflows/ci.yml` + `cd.yml` — CI/CD.
- `Dockerfile` (root = frontend), `backend/Dockerfile`, `docker-compose.yml`, `nginx.conf.template`.
- Backend: `models/User.js`, `middleware/auth.js`, `services/userService.js`, `routes/users.js`, tests (`7+ pass`).
- Frontend: `src/AuthContext.jsx`, `components/Signup.jsx`/`Login.jsx`/`CreatePost.jsx` (auth-gated).
