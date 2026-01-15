"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  Phone,
  MapPin,
  Edit,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfileModal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || `${user?.id}@univ.ma`,
    phone: '+212 6XX XXX XXX', // Données mockées
  })

  if (!user) return null

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
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'dean':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'department':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'student':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  const handleSaveProfile = () => {
    // Simulation de sauvegarde
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
      variant: "default",
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || `${user.id}@univ.ma`,
      phone: '+212 6XX XXX XXX',
    })
    setIsEditing(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2">
          <User className="mr-2 h-4 w-4" />
          <span>Mon Profil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            Mon Profil
          </DialogTitle>
          <DialogDescription>
            Consultez et modifiez vos informations personnelles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Photo et Infos de Base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name || '')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <Badge className={`mt-1 ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {user.department && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Département:</span>
                        <span className="font-medium">{user.department}</span>
                      </div>
                    )}
                    {user.formation && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Formation:</span>
                        <span className="font-medium">{user.formation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Informations de Contact */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Informations de Contact</CardTitle>
                <CardDescription>
                  {isEditing ? "Modifiez vos informations" : "Vos coordonnées"}
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{editForm.firstName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{editForm.lastName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{editForm.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{editForm.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Informations Académiques */}
          {(user.department || user.formation) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations Académiques</CardTitle>
                <CardDescription>Vos informations institutionnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.department && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Département</p>
                        <p className="font-medium">{user.department}</p>
                      </div>
                    </div>
                  )}

                  {user.formation && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Formation</p>
                        <p className="font-medium">{user.formation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Statistiques (pour étudiants) */}
          {user.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques Académiques</CardTitle>
                <CardDescription>Votre activité cette année</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-muted-foreground">Examens</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">24h</div>
                    <p className="text-xs text-muted-foreground">Total Heures</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">16.5/20</div>
                    <p className="text-xs text-muted-foreground">Moyenne</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <p className="text-xs text-muted-foreground">Présence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section ID Système */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations Système</CardTitle>
              <CardDescription>Identifiants techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">ID Utilisateur:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">{user.id}</code>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Rôle Système:</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Dernière Connexion:</span>
                  <span className="text-sm">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
