import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecipes } from "../api"
import { FormError } from "./FormBits"

function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe._id}`} className="group block pb-6">
      <div className="relative">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="aspect-[3/4] w-full bg-background object-cover transition-opacity group-hover:opacity-90"
        />
        <h2 className="absolute inset-x-4 -bottom-6 bg-gold px-3 py-3 text-center font-sans text-xs font-bold uppercase leading-snug tracking-[0.2em] text-gold-foreground group-hover:underline">
          {recipe.title}
        </h2>
      </div>
    </Link>
  )
}

export default function RecipeList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => fetchRecipes(),
  })

  return (
    <>
      <p className="px-4 py-10 text-center font-sans text-sm font-semibold uppercase tracking-[0.25em] sm:text-base">
        Simple recipes made for{" "}
        <span className="font-script text-2xl normal-case tracking-normal text-primary sm:text-3xl">
          real, actual, everyday life.
        </span>
      </p>
      <section className="bg-muted px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <FormError message={isError && `Couldn’t load recipes: ${error.message}`} />
          {data?.length === 0 && (
            <p className="text-center italic text-muted-foreground">
              No recipes yet.{" "}
              <Link to="/new" className="text-primary underline-offset-4 hover:underline">
                Share the first one!
              </Link>
            </p>
          )}
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-none" />)}
            {data?.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} />)}
          </div>
        </div>
      </section>
    </>
  )
}
