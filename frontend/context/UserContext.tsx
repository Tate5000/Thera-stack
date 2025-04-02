import React, { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  name: string
  role: 'admin' | 'doctor' | 'patient'
  email?: string
}

interface UserContextType {
  user: User
  setUser: (user: User) => void
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

// Default user for demo purposes
const defaultUser: User = {
  id: 'patient1',
  name: 'Alex Garcia',
  role: 'patient',
  email: 'alex@example.com'
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true) // Auto-login for demo

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(defaultUser)
    setIsAuthenticated(false)
  }

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}