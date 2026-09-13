export default function Post({ post }) {
  return (
    <article className="post">
      {post.imageUrl && (
        <img className="post-image" src={post.imageUrl} alt="" />
      )}
      <h2 className="post-title">{post.title}</h2>
      <p className="post-content">{post.content}</p>
      <footer className="post-meta">
        {post.author && <span className="post-author">by {post.author}</span>}
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </footer>
    </article>
  )
}