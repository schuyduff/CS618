const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchPosts() {
  const res = await fetch(`${API_URL}/api/posts`);
  const body = await handle(res);
  return body.posts;
}

export async function createPost(post) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  return handle(res)
}