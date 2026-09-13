import Post from "./Post.jsx";

export default function PostList({ posts, isLoading, isError }) {
  if (isLoading) {
    return <p className="empty">Loading posts...</p>;
  }

  if (isError) {
    return <p className="empty">Could not load posts from the backend.</p>;
  }

  if (!posts.length) {
    return <p className="empty">No posts yet. Create the first one above.</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}