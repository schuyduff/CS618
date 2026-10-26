import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Eye, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "../AuthContext"
import { fetchRecipes } from "../api"
import DeleteRecipeButton from "./DeleteRecipeButton"
import { FormError } from "./FormBits"

// Only reachable through <RequireAuth>, so `user` is always set here.
export default function MyRecipes() {
  const { user } = useAuth()
  const author = user._id
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recipes", { author }],
    queryFn: () => fetchRecipes({ author }),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-black">My recipes</h1>
      {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      <FormError message={isError && `Couldn’t load your recipes: ${error.message}`} />
      {data?.length === 0 && (
        <div className="space-y-4 border border-dashed p-8 text-center">
          <p className="italic text-muted-foreground">You haven’t shared any recipes yet.</p>
          <Button asChild>
            <Link to="/new">
              <Plus /> New recipe
            </Link>
          </Button>
        </div>
      )}
      {data?.length > 0 && (
      <ul className="divide-y border-y">
        {data.map((recipe) => (
          <li key={recipe._id} className="flex flex-wrap items-center gap-4 py-4">
            <img src={recipe.imageUrl} alt={recipe.title} className="size-20 shrink-0 bg-muted object-cover" />
            <div className="min-w-0 flex-1">
              <Link
                to={`/recipes/${recipe._id}`}
                className="break-words font-display text-xl font-bold hover:text-primary"
              >
                {recipe.title}
              </Link>
              <p className="text-sm italic text-muted-foreground">
                {recipe.ingredients.length} ingredient{recipe.ingredients.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/recipes/${recipe._id}`}>
                  <Eye /> View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/recipes/${recipe._id}/edit`}>
                  <Pencil /> Edit
                </Link>
              </Button>
              <DeleteRecipeButton recipe={recipe} />
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}
