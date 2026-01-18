"use client"
import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Eye,
  Save,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || `${user?.id}@univ.ma`,
    phone: '+212 6XX XXX XXX',
    bio: 'Étudiant en informatique passionné par les nouvelles technologies.',
    language: 'fr'
  })
  const [notifications, setNotifications] = useState({
    emailExams: true,
    emailReminders: true,
    emailUpdates: false,
    pushExams: true,
    pushReminders: false,
    pushUpdates: false,
    smsCritical: true
  })
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: '30'
  })
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false
  })
  const [preferences, setPreferences] = useState({
    defaultView: 'calendar',
    timeFormat: '24h',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Africa/Casablanca',
    autoSave: true,
    showTips: true
  })
  const handleSavePersonalInfo = () => {
    toast({
      title: "Informations sauvegardées",
      description: "Vos informations personnelles ont été mises à jour.",
      variant: "default",
    })
  }
  const handleSaveNotifications = () => {
    toast({
      title: "Préférences sauvegardées",
      description: "Vos paramètres de notification ont été mis à jour.",
      variant: "default",
    })
  }
  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }
    if (security.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Mot de passe changé",
      description: "Votre mot de passe a été mis à jour avec succès.",
      variant: "default",
    })
    setSecurity(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }))
  }
  const handleSaveSecurity = () => {
    toast({
      title: "Paramètres de sécurité sauvegardés",
      description: "Vos paramètres de sécurité ont été mis à jour.",
      variant: "default",
    })
  }
  const handleSaveAccessibility = () => {
    toast({
      title: "Paramètres d'accessibilité sauvegardés",
      description: "Vos préférences d'accessibilité ont été appliquées.",
      variant: "default",
    })
  }
  const handleSavePreferences = () => {
    toast({
      title: "Préférences sauvegardées",
      description: "Vos préférences générales ont été mises à jour.",
      variant: "default",
    })
  }
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
  }
  if (!user) return null
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Paramètres"
          subtitle="Gérez vos préférences et paramètres personnels"
        />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Paramètres</h1>
              <p className="text-muted-foreground mt-2">
                Personnalisez votre expérience utilisateur
              </p>
            </div>
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'dean' ? '/dean' : user.role === 'department' ? '/department' : '/student'}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au dashboard
              </Button>
            </Link>
          </div>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Apparence</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Préférences</span>
              </TabsTrigger>
            </TabsList>
            {}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations Personnelles
                  </CardTitle>
                  <CardDescription>
                    Gérez vos informations de profil et coordonnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="flex items-start gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(user.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role === 'admin' ? 'Administrateur' :
                           user.role === 'dean' ? 'Vice-Doyen' :
                           user.role === 'department' ? 'Chef de Département' : 'Étudiant'}
                        </Badge>
                        {user.department && (
                          <Badge variant="secondary">{user.department}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            value={personalInfo.firstName}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            value={personalInfo.lastName}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Langue</Label>
                        <Select value={personalInfo.language} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biographie</Label>
                        <Textarea
                          id="bio"
                          value={personalInfo.bio}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Décrivez-vous brièvement..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSavePersonalInfo}>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Préférences de Notification
                  </CardTitle>
                  <CardDescription>
                    Choisissez comment vous souhaitez être notifié
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notifications par email
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-exams">Examens et résultats</Label>
                          <p className="text-sm text-muted-foreground">Notifications pour les nouveaux examens et publications de résultats</p>
                        </div>
                        <Switch
                          id="email-exams"
                          checked={notifications.emailExams}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailExams: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-reminders">Rappels</Label>
                          <p className="text-sm text-muted-foreground">Rappels avant les examens (24h et 1h)</p>
                        </div>
                        <Switch
                          id="email-reminders"
                          checked={notifications.emailReminders}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailReminders: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-updates">Mises à jour système</Label>
                          <p className="text-sm text-muted-foreground">Annonces importantes et mises à jour de l'application</p>
                        </div>
                        <Switch
                          id="email-updates"
                          checked={notifications.emailUpdates}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Notifications push
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-exams">Examens</Label>
                          <p className="text-sm text-muted-foreground">Notifications en temps réel pour les examens</p>
                        </div>
                        <Switch
                          id="push-exams"
                          checked={notifications.pushExams}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushExams: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-reminders">Rappels d'examens</Label>
                          <p className="text-sm text-muted-foreground">Rappels push pour les examens à venir</p>
                        </div>
                        <Switch
                          id="push-reminders"
                          checked={notifications.pushReminders}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushReminders: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-updates">Mises à jour</Label>
                          <p className="text-sm text-muted-foreground">Notifications pour les changements importants</p>
                        </div>
                        <Switch
                          id="push-updates"
                          checked={notifications.pushUpdates}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushUpdates: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Notifications SMS
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-critical">Alertes critiques</Label>
                          <p className="text-sm text-muted-foreground">SMS pour les urgences et changements importants</p>
                        </div>
                        <Switch
                          id="sms-critical"
                          checked={notifications.smsCritical}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsCritical: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité du Compte
                  </CardTitle>
                  <CardDescription>
                    Gérez la sécurité de votre compte et vos accès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Changer le mot de passe
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Mot de passe actuel</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={security.newPassword}
                          onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleChangePassword} variant="outline">
                      <Key className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Authentification 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Ajoutez une couche de sécurité supplémentaire à votre compte
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={security.twoFactorEnabled ? "default" : "secondary"}>
                          {security.twoFactorEnabled ? "Activé" : "Désactivé"}
                        </Badge>
                        <Switch
                          checked={security.twoFactorEnabled}
                          onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium">Session et accès</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="session-timeout">Timeout de session</Label>
                          <p className="text-sm text-muted-foreground">
                            Durée d'inactivité avant déconnexion automatique
                          </p>
                        </div>
                        <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 heure</SelectItem>
                            <SelectItem value="240">4 heures</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSecurity}>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les paramètres
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Apparence et Accessibilité
                  </CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Thème de l'application
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="h-5 w-5" />
                          <span className="font-medium">Clair</span>
                        </div>
                        <div className="w-full h-8 bg-white border rounded"></div>
                      </div>
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Moon className="h-5 w-5" />
                          <span className="font-medium">Sombre</span>
                        </div>
                        <div className="w-full h-8 bg-gray-900 border rounded"></div>
                      </div>
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                        onClick={() => setTheme('system')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="h-5 w-5" />
                          <span className="font-medium">Système</span>
                        </div>
                        <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 border rounded"></div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Options d'accessibilité
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="high-contrast">Contraste élevé</Label>
                          <p className="text-sm text-muted-foreground">
                            Améliore la visibilité des éléments
                          </p>
                        </div>
                        <Switch
                          id="high-contrast"
                          checked={accessibility.highContrast}
                          onCheckedChange={(checked) => setAccessibility(prev => ({ ...prev, highContrast: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="large-text">Texte agrandi</Label>
                          <p className="text-sm text-muted-foreground">
                            Augmente la taille du texte dans l'interface
                          </p>
                        </div>
                        <Switch
                          id="large-text"
                          checked={accessibility.largeText}
                          onCheckedChange={(checked) => setAccessibility(prev => ({ ...prev, largeText: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reduce-motion">Réduire les animations</Label>
                          <p className="text-sm text-muted-foreground">
                            Désactive les animations pour éviter les vertiges
                          </p>
                        </div>
                        <Switch
                          id="reduce-motion"
                          checked={accessibility.reduceMotion}
                          onCheckedChange={(checked) => setAccessibility(prev => ({ ...prev, reduceMotion: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="screen-reader">Support lecteur d'écran</Label>
                          <p className="text-sm text-muted-foreground">
                            Optimise l'interface pour les lecteurs d'écran
                          </p>
                        </div>
                        <Switch
                          id="screen-reader"
                          checked={accessibility.screenReader}
                          onCheckedChange={(checked) => setAccessibility(prev => ({ ...prev, screenReader: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveAccessibility}>
                      <Save className="mr-2 h-4 w-4" />
                      Appliquer les paramètres
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Préférences Générales
                  </CardTitle>
                  <CardDescription>
                    Configurez vos préférences d'utilisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium">Interface</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="default-view">Vue par défaut</Label>
                        <Select value={preferences.defaultView} onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultView: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="calendar">Calendrier</SelectItem>
                            <SelectItem value="list">Liste</SelectItem>
                            <SelectItem value="cards">Cartes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuseau horaire</Label>
                        <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Casablanca">Afrique du Nord (UTC+1)</SelectItem>
                            <SelectItem value="Europe/Paris">Europe Centrale (UTC+1)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium">Formats d'affichage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="time-format">Format heure</Label>
                        <Select value={preferences.timeFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, timeFormat: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                            <SelectItem value="24h">24 heures</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-format">Format date</Label>
                        <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                            <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Langue</Label>
                        <Select value={personalInfo.language} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {}
                  <div className="space-y-4">
                    <h4 className="font-medium">Comportement</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-save">Sauvegarde automatique</Label>
                          <p className="text-sm text-muted-foreground">
                            Sauvegarde automatiquement vos modifications
                          </p>
                        </div>
                        <Switch
                          id="auto-save"
                          checked={preferences.autoSave}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-tips">Afficher les conseils</Label>
                          <p className="text-sm text-muted-foreground">
                            Montre les info-bulles d'aide dans l'interface
                          </p>
                        </div>
                        <Switch
                          id="show-tips"
                          checked={preferences.showTips}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showTips: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences}>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
