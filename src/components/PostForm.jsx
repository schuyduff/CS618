import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createPost } from "../api"
import { Field, FormError } from "./FormBits"

export default function PostForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      navigate(`/posts/${post._id}`)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    const data = { title: title.trim(), content: content.trim() }
    if (imageUrl.trim()) data.imageUrl = imageUrl.trim()
    mutation.mutate(data)
  }

  return (
    <>
      <h1 className="mb-8 font-display text-4xl font-black">New post</h1>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <FormError message={mutation.error?.message} />
        <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        <Field label="Content" as={Textarea} rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
        <Field
          label="Image URL (optional)"
          type="url"
          placeholder="https://…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Publish post"}
          </Button>
        </div>
      </form>
    </>
  )
}
