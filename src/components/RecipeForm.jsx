import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { AlertCircle, Plus, Upload, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "../AuthContext"
import { createRecipe, fetchRecipe, updateRecipe, uploadImage } from "../api"
import { Field, FormError } from "./FormBits"

// Must match backend/routes/images.js.
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Shared by create (no `recipe`) and edit (`recipe` given).
function RecipeForm({ recipe }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(recipe?.title ?? "")
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl ?? "")
  const [ingredients, setIngredients] = useState(recipe?.ingredients?.length ? recipe.ingredients : [""])
  const [previewOk, setPreviewOk] = useState(true)
  const [focusLast, setFocusLast] = useState(false)
  const [clientError, setClientError] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploadName, setUploadName] = useState(null)
  const fileInput = useRef(null)
  const uploaded = imageUrl.startsWith("/api/images/")

  const upload = useMutation({
    mutationFn: uploadImage,
    onSuccess: ({ url }) => {
      setImageUrl(url)
      setPreviewOk(true)
    },
    onError: (err) => setUploadError(err.message),
  })

  function uploadFile(file) {
    if (!file) return
    setUploadError(null)
    if (!IMAGE_TYPES.includes(file.type)) return setUploadError("Choose a PNG, JPEG, WebP or GIF image.")
    if (file.size > MAX_IMAGE_BYTES) return setUploadError("Images must be 5 MB or smaller.")
    setUploadName(file.name)
    upload.mutate(file)
  }

  // Pasting a screenshot anywhere in the form uploads it; plain text pastes are untouched.
  function handlePaste(e) {
    const file = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"))
    if (!file) return
    e.preventDefault()
    uploadFile(file)
  }

  const mutation = useMutation({
    mutationFn: (data) => (recipe ? updateRecipe(recipe._id, data) : createRecipe(data)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      // Seed the detail cache so the page we navigate to never shows pre-edit data.
      queryClient.setQueryData(["recipe", saved._id], saved)
      navigate(`/recipes/${saved._id}`)
    },
  })

  function setIngredient(i, value) {
    setIngredients((list) => list.map((item, j) => (j === i ? value : item)))
  }

  function addIngredient() {
    setFocusLast(true)
    setIngredients((list) => [...list, ""])
  }

  // A multi-line paste (e.g. a "- item" list from docs/test-recipes.md) becomes one row per line,
  // filling row i if it's empty, else inserting after it. Single-line pastes behave normally.
  function pasteIngredients(i, e) {
    const lines = e.clipboardData
      .getData("text")
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
      .filter((line) => line && !/^\**ingredients:?\**:?$/i.test(line))
    if (lines.length < 2) return
    e.preventDefault()
    setIngredients((list) => {
      const at = list[i].trim() ? i + 1 : i
      const rest = list.slice(at + (at === i ? 1 : 0))
      return [...list.slice(0, at), ...lines, ...rest].slice(0, 100)
    })
  }

  function removeIngredient(i) {
    setIngredients((list) => list.filter((_, j) => j !== i))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const cleaned = ingredients.map((item) => item.trim()).filter(Boolean)
    if (cleaned.length === 0) return setClientError("Add at least one ingredient.")
    setClientError(null)
    mutation.mutate({ title: title.trim(), ingredients: cleaned, imageUrl: imageUrl.trim() })
  }

  return (
    <form onSubmit={handleSubmit} onPaste={handlePaste} className="grid gap-6">
      <FormError message={clientError || mutation.error?.message} />
      <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      <div className="grid gap-2">
        {uploaded ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Image</span>
            <span className="text-muted-foreground">Uploaded {uploadName || "image"}</span>
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setImageUrl("")}>
              Use a URL instead
            </Button>
          </div>
        ) : (
          <Field
            label="Image URL"
            type="url"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setPreviewOk(true)
            }}
            required
          />
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {!uploaded && <span>or</span>}
          <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => fileInput.current.click()}>
            <Upload /> {upload.isPending ? "Uploading…" : uploaded ? "Replace image" : "Upload an image"}
          </Button>
          <span>PNG, JPEG, WebP or GIF up to 5 MB. You can also paste a screenshot.</span>
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload an image"
            onChange={(e) => {
              uploadFile(e.target.files[0])
              e.target.value = ""
            }}
          />
        </div>
        <FormError message={uploadError} />
      </div>
      {imageUrl && previewOk && (
        <img
          src={imageUrl}
          alt={title ? `Preview of ${title}` : "Recipe image preview"}
          onError={() => setPreviewOk(false)}
          className="aspect-[4/3] w-full max-w-sm rounded-md bg-muted object-cover"
        />
      )}
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium leading-none">Ingredients</legend>
        <p className="-mt-1 mb-1 text-sm text-muted-foreground">Tip: paste a list to add several ingredients at once.</p>
        {ingredients.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              aria-label={`Ingredient ${i + 1}`}
              placeholder="e.g. 2 cups flour"
              value={item}
              maxLength={200}
              autoFocus={focusLast && i === ingredients.length - 1}
              onChange={(e) => setIngredient(i, e.target.value)}
              onPaste={(e) => pasteIngredients(i, e)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                if (i === ingredients.length - 1 && ingredients.length < 100) addIngredient()
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ingredient ${i + 1}`}
              disabled={ingredients.length === 1}
              onClick={() => removeIngredient(i)}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          disabled={ingredients.length >= 100}
          onClick={addIngredient}
        >
          <Plus /> Add ingredient
        </Button>
      </fieldset>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending || upload.isPending}>
          {mutation.isPending ? "Saving…" : recipe ? "Save changes" : "Publish recipe"}
        </Button>
      </div>
    </form>
  )
}

function Heading({ children }) {
  return <h1 className="mb-8 font-display text-4xl font-black">{children}</h1>
}

export function NewRecipe() {
  return (
    <>
      <Heading>New recipe</Heading>
      <RecipeForm />
    </>
  )
}

// Only reachable through <RequireAuth>, so `user` is always set here.
export function EditRecipe() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: recipe, isLoading, isError, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
  })

  let body
  if (isLoading) body = <Skeleton className="h-96 w-full" />
  else if (isError) body = <FormError message={`Couldn’t load recipe: ${error.message}`} />
  else if (recipe.author?._id !== user._id) {
    body = (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Not your recipe</AlertTitle>
        <AlertDescription>You can only edit your own recipes.</AlertDescription>
      </Alert>
    )
  } else body = <RecipeForm key={recipe.updatedAt} recipe={recipe} />

  return (
    <>
      <Heading>Edit recipe</Heading>
      {body}
    </>
  )
}
