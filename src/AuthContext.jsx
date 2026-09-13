import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("cs618_user")
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("cs618_token")
      localStorage.removeItem("cs618_user")
    }
  }, [user])

  function storeSession(payload) {
    localStorage.setItem("cs618_token", payload.token)
    localStorage.setItem("cs618_user", JSON.stringify(payload.user))
    setUser(payload.user)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem("cs618_token")
    localStorage.removeItem("cs618_user")
  }

  return (
    <AuthContext.Provider value={{ user, storeSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// react-refresh wants only components exported; the provider + this shared
// hook intentionally live together (standard pattern).
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
