import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPost, trackEvent } from "../api"
import { FormError } from "./FormBits"
import PostStats from "./PostStats"

const dateFormat = { month: "long", day: "numeric", year: "numeric" }

function getSession() {
  let session = sessionStorage.getItem("cs618_session")
  if (!session) {
    session = crypto.randomUUID()
    sessionStorage.setItem("cs618_session", session)
  }
  return session
}

export default function PostDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  })

  // One startView per mount; the timeout is cleared by StrictMode's dev-only unmount, so it fires once.
  useEffect(() => {
    const timeout = setTimeout(() => {
      trackEvent({ postId: id, session: getSession(), action: "startView" })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["totalViews", id] })
          queryClient.invalidateQueries({ queryKey: ["dailyViews", id] })
        })
        .catch(() => {})
    }, 0)
    return () => clearTimeout(timeout)
  }, [id, queryClient])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (isError) return <FormError message={`Couldn’t load post: ${error.message}`} />

  return (
    <article className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm italic text-muted-foreground">
        <Link to="/" className="hover:text-primary hover:underline">
          Home
        </Link>{" "}
        &gt; <span aria-current="page">{post.title}</span>
      </nav>
      <h1 className="break-words font-display text-4xl font-black leading-tight sm:text-6xl">{post.title}</h1>
      <p className="italic text-muted-foreground">
        Posted on{" "}
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("en-US", dateFormat)}</time>
      </p>
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="aspect-[4/3] w-full bg-muted object-cover" />}
      <div className="whitespace-pre-wrap break-words text-lg leading-relaxed">{post.content}</div>
      <PostStats postId={id} />
    </article>
  )
}
