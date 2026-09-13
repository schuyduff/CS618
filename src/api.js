// Same-origin by default: Vite dev server proxies /api -> backend :3000,
// so the browser never sends a cross-origin request (no CORS, works in
// Codespaces regardless of the forwarded *.app.github.dev host).
// Override with VITE_API_URL only when the backend is served elsewhere.
const API_URL = import.meta.env.VITE_API_URL || "/api"

function getToken() {
  return localStorage.getItem("cs618_token")
}

function authHeaders(extra = {}) {
  const token = getToken()
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : extra
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401) {
      localStorage.removeItem("cs618_token")
      window.location.href = "/login"
    }
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchPosts() {
  const res = await fetch(`${API_URL}/posts`)
  const body = await handle(res)
  return body.posts
}

export async function createPost(post) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(post),
  })
  return handle(res)
}

export async function signup({ username, email, password }) {
  const res = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
  return handle(res)
}

export async function login({ identifier, password }) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })
  return handle(res)
}
