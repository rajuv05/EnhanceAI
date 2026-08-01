import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface AuthContextType {
  user: any | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  restoreSession: () => Promise<void>
  toast: Toast | null
  showToast: (message: string, type: 'success' | 'error') => void
  clearToast: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  const restoreSession = async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setLoading(false)
      setToken(null)
      setUser(null)
      return
    }

    try {
      setToken(storedToken)
      const userData = await authService.getMe()
      setUser(userData)
    } catch (err) {
      console.error("Session restoration failed", err)
      // Do NOT remove token automatically if it's just a network error
      // Only remove if it's a 401/403
      if ((err as any).response?.status === 401 || (err as any).response?.status === 403) {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    restoreSession()
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    restoreSession()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 5000)
  }

  const clearToast = () => setToast(null)

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      restoreSession,
      toast,
      showToast,
      clearToast
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
