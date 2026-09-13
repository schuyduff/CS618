import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext"
import { createPost } from "../api"

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const mutation = useMutation({
    mutationFn: (post) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      navigate("/", { replace: true })
    },
  })

  if (!user) {
    return (
      <main className="container">
        <h1>Create a post</h1>
        <p>
          You must be logged in to create a post.{" "}
          <Link to="/login">Log in</Link> or{" "}
          <Link to="/signup">sign up</Link>.
        </p>
      </main>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate({ title, content })
  }

  return (
    <main className="container">
      <h1>Create a post</h1>
      <p>Creating as {user.username}</p>
      {mutation.isError && <p className="error">{mutation.error.message}</p>}
      <form onSubmit={handleSubmit} className="post-form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating…" : "Create Post"}
        </button>
      </form>
    </main>
  )
}
