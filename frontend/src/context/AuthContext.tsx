import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  toast: Toast | null
  showToast: (message: string, type: 'success' | 'error') => void
  clearToast: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    fetchUser()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
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
      loading,
      isAuthenticated: !!user,
      login,
      logout,
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
