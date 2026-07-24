import React, { createContext, useContext, useState, useCallback } from 'react'
import type { LoginResponse, Role } from '../types'

interface AuthState {
  token: string | null
  user: { id: number; email: string; name: string; role: Role } | null
}

interface AuthContextValue extends AuthState {
  login: (res: LoginResponse) => void
  logout: () => void
  isAuthenticated: boolean
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): AuthState {
  try {
    const token = localStorage.getItem('keystone_token')
    const raw   = localStorage.getItem('keystone_user')
    if (token && raw) return { token, user: JSON.parse(raw) }
  } catch { /* ignore */ }
  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadFromStorage)

  const login = useCallback((res: LoginResponse) => {
    const user = { id: res.userId, email: res.email, name: res.name, role: res.role }
    localStorage.setItem('keystone_token', res.token)
    localStorage.setItem('keystone_user', JSON.stringify(user))
    setState({ token: res.token, user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('keystone_token')
    localStorage.removeItem('keystone_user')
    setState({ token: null, user: null })
  }, [])

  const hasRole = useCallback((...roles: Role[]) =>
    !!state.user && roles.includes(state.user.role), [state.user])

  return (
    <AuthContext.Provider value={{
      ...state,
      login, logout,
      isAuthenticated: !!state.token,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
