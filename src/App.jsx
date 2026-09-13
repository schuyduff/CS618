import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import CreatePost from "./components/CreatePost"
import PostList from "./components/PostList"
import Login from "./components/Login"
import Signup from "./components/Signup"
import { AuthProvider, useAuth } from "./AuthContext"

const queryClient = new QueryClient()

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Home() {
  return (
    <main className="container">
      <h1>CS618 Blog</h1>
      <PostList />
    </main>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/new"
              element={
                <RequireAuth>
                  <CreatePost />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
