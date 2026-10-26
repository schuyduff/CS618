import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowDown, Pencil } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "../AuthContext"
import { fetchRecipe } from "../api"
import DeleteRecipeButton from "./DeleteRecipeButton"
import { FormError } from "./FormBits"

const dateFormat = { month: "long", day: "numeric", year: "numeric" }

export default function RecipeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="aspect-[4/3] w-full" />
      </div>
    )
  }
  if (isError) return <FormError message={`Couldn’t load recipe: ${error.message}`} />

  const author = recipe.author?.username || "unknown"
  const isOwner = user && recipe.author?._id === user._id

  return (
    <article className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm italic text-muted-foreground">
        <Link to="/" className="hover:text-primary hover:underline">
          Recipes
        </Link>{" "}
        &gt; <span aria-current="page">{recipe.title}</span>
      </nav>
      <h1 className="break-words font-display text-4xl font-black leading-tight sm:text-6xl">{recipe.title}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary font-sans text-sm font-bold text-primary-foreground">
            {author[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="mr-auto italic text-muted-foreground">
          Published by <span className="font-semibold text-foreground">{author}</span> on{" "}
          <time dateTime={recipe.createdAt}>
            {new Date(recipe.createdAt).toLocaleDateString("en-US", dateFormat)}
          </time>
        </p>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/recipes/${recipe._id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <DeleteRecipeButton recipe={recipe} onDeleted={() => navigate("/my", { replace: true })} />
          </div>
        )}
      </div>
      <a
        href="#ingredients"
        className="flex w-full items-center justify-center gap-2 bg-muted py-3 font-sans text-xs font-bold uppercase tracking-[0.25em] text-primary hover:bg-muted/70 sm:text-sm"
      >
        <ArrowDown className="size-4" /> Jump to ingredients
      </a>
      <img src={recipe.imageUrl} alt={recipe.title} className="aspect-[4/3] w-full bg-muted object-cover" />
      <section id="ingredients" className="scroll-mt-6 border-t-4 border-primary pt-6">
        <h2 className="mb-4 font-display text-3xl font-bold">Ingredients</h2>
        <ul className="space-y-3 text-lg">
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-1.5 size-4 shrink-0 rounded-sm border-2 border-primary" />
              <span className="break-words">{ingredient}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
