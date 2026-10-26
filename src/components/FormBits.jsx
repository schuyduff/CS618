import { useId } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Field({ label, as: Control = Input, ...props }) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Control id={id} {...props} />
    </div>
  )
}

export function FormError({ message }) {
  if (!message) return null
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
