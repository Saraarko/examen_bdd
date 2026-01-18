"use client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings, GraduationCap } from "lucide-react"
import { ProfileModal } from "@/components/profile-modal"
import { ThemeToggle } from "@/components/theme-toggle"
interface DashboardNavProps {
  title: string
  subtitle?: string
}
export function DashboardNav({ title, subtitle }: DashboardNavProps) {
  const { user, logout } = useAuth()
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'dean':
        return 'Vice-Doyen'
      case 'department':
        return 'Chef de Département'
      case 'student':
        return 'Étudiant'
      case 'teacher':
        return 'Enseignant'
      default:
        return role
    }
  }
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500'
      case 'dean':
        return 'bg-purple-500/10 text-purple-500'
      case 'department':
        return 'bg-blue-500/10 text-blue-500'
      case 'student':
        return 'bg-green-500/10 text-green-500'
      case 'teacher':
        return 'bg-orange-500/10 text-orange-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
  }
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </Link>
          </div>
          {}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Bienvenue,</span>
                  <span className="font-medium">{user.name}</span>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  {user.department && (
                    <span className="text-muted-foreground">• {user.department}</span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || `${user.id}@univ.ma`}
                        </p>
                        <Badge className={`w-fit mt-1 ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ProfileModal />
                    <DropdownMenuItem asChild>
                      <Link href="/parametres">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se Déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
