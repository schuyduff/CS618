import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteRecipe } from "../api"
import { FormError } from "./FormBits"

export default function DeleteRecipeButton({ recipe, onDeleted, size = "sm" }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const mutation = useMutation({
    mutationFn: () => deleteRecipe(recipe._id),
    onSuccess: () => {
      setOpen(false)
      onDeleted?.()
      queryClient.removeQueries({ queryKey: ["recipe", recipe._id], exact: true })
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={size}>
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{recipe.title}”?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes the recipe. It can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <FormError message={mutation.error?.message} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
