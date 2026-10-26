import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Login from "./components/Login"
import MyRecipes from "./components/MyRecipes"
import RecipeDetail from "./components/RecipeDetail"
import { EditRecipe, NewRecipe } from "./components/RecipeForm"
import RecipeList from "./components/RecipeList"
import Signup from "./components/Signup"
import ThemeToggle from "./components/ThemeToggle"
import { useAuth } from "./AuthContext"

function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

const navClass = ({ isActive }) =>
  `font-sans text-xs font-bold uppercase tracking-[0.2em] hover:text-primary ${isActive ? "text-primary" : ""}`

function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-svh">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
          <Link to="/" className="font-serif text-3xl lowercase italic tracking-tight text-primary">
            cs618 recipes
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            {user && (
              <NavLink to="/my" className={navClass}>
                My recipes
              </NavLink>
            )}
            <Button size="sm" className="font-sans text-xs font-bold uppercase tracking-[0.15em]" asChild>
              <Link to="/new">
                <Plus /> New recipe
              </Link>
            </Button>
            {user ? (
              <>
                <span className="text-sm italic text-muted-foreground">Hi, {user.username}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut /> Log out
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className={navClass}>
                  Sign up
                </NavLink>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  )
}

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RecipeList />} />
          <Route element={<Page />}>
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/new" element={<NewRecipe />} />
              <Route path="/recipes/:id/edit" element={<EditRecipe />} />
              <Route path="/my" element={<MyRecipes />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
