import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api.js";

export default function CreatePost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    mutation.mutate(
      {
        title: formData.get("title"),
        author: formData.get("author"),
        content: formData.get("content"),
        imageUrl: formData.get("imageUrl"),
      },
      { onSuccess: () => event.target.reset() }
    );
  }

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h2>Create a post</h2>
      <label>
        Title
        <input type="text" name="title" required placeholder="Post title" />
      </label>
      <label>
        Author
        <input type="text" name="author" placeholder="Your name (optional)" />
      </label>
      <label>
        Content
        <textarea
          name="content"
          required
          placeholder="Write your post..."
          rows={4}
        />
      </label>
      <label>
        Image URL
        <input type="url" name="imageUrl" placeholder="https://... (optional)" />
      </label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create post"}
      </button>
      {mutation.isError && <p className="error">{mutation.error.message}</p>}
    </form>
  );
}