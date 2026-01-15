"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  id: string
  name: string
  role: "admin" | "dean" | "department" | "student" | "teacher"
  department?: string
  formation?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  const requireAuth = (requiredRole?: User['role']) => {
    if (isLoading) return null

    if (!user) {
      router.push('/login')
      return null
    }

    if (requiredRole && user.role !== requiredRole) {
      // Rediriger vers le bon dashboard selon le rôle
      switch (user.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'dean':
          router.push('/dean')
          break
        case 'department':
          router.push('/department')
          break
        case 'student':
          router.push('/student')
          break
        case 'teacher':
          router.push('/teacher')
          break
        default:
          router.push('/login')
      }
      return null
    }

    return user
  }

  return {
    user,
    isLoading,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!user
  }
}
