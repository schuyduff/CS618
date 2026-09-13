import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "./api.js";
import CreatePost from "./components/CreatePost.jsx";
import PostList from "./components/PostList.jsx";
import "./App.css";

export default function App() {
  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <div className="blog">
      <header className="masthead">
        <h1>CS618 Blog</h1>
        <p className="tagline">
          Post a recipe or update and see it appear instantly.
        </p>
      </header>
      <main>
        <CreatePost />
        <section className="feed">
          <h2>All posts</h2>
          <PostList
            posts={posts}
            isLoading={isLoading}
            isError={isError}
          />
        </section>
      </main>
    </div>
  );
}