import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useAuth } from "../AuthContext"
import { fetchPosts } from "../api"

export default function PostList() {
  const { user, logout } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  })

  return (
    <>
      <header className="site-header">
        <nav>
          <strong>CS618 Blog</strong>
          {user ? (
            <>
              <span>Hi, {user.username}</span>
              <button onClick={logout} className="link-button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
          <Link to="/new" className="create-link">
            + Create Post
          </Link>
        </nav>
      </header>

      {isLoading && <p>Loading posts…</p>}
      {isError && <p className="error">{error.message}</p>}

      <ul className="post-list">
        {data?.map((post) => (
          <li key={post._id} className="post-item">
            <h2>{post.title}</h2>
            <p className="post-meta">
              by {post.author?.username || "anonymous"} ·{" "}
              {new Date(post.createdAt).toLocaleString()}
            </p>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
