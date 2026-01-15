"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useSchedule } from "@/contexts/schedule-context"
import { useAuth } from "@/hooks/use-auth"
import { getTeacherPlanning } from "@/app/actions"
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  BarChart3,
  Award,
  Target
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
// import mockData from "@/data/mock-data.json" // Removed - using DB instead

interface TeacherModule {
  id: string
  name: string
  code: string
  formation: string
  semester: number
  credits: number
  studentCount: number
  examDate?: string
  examRoom?: string
}

interface SupervisionExam {
  id: number
  moduleName: string
  formation: string
  date: string
  startTime: string
  endTime: string
  room: string
  studentCount: number
  professor: string
}

export default function TeacherPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [teacherData, setTeacherData] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (user?.email) {
        try {
          const data = await getTeacherPlanning(user.email)
          setTeacherData(data)
        } catch (e) {
          console.error("Failed to fetch teacher planning", e)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user])

  if (loading || !teacherData) return <div>Chargement...</div>

  const supervisionExams = teacherData.exams.map((e: any) => ({
    id: e.id,
    moduleName: e.module.name,
    formation: e.module.formation || "N/A",
    date: e.sessionDate,
    startTime: e.startTime,
    endTime: e.endTime,
    room: e.examRoom.name,
    studentCount: e.module.studentCount || 0,
    professor: teacherData.firstName + " " + teacherData.lastName
  }))

  const updatedTeacherModules = Array.from(new Map(teacherData.exams.map((e: any) => [e.module.id, {
    id: e.module.id,
    name: e.module.name,
    code: e.module.code,
    formation: e.module.formation,
    semester: e.module.semester,
    credits: e.module.credits,
    studentCount: e.module.studentCount,
    examDate: e.sessionDate,
    examRoom: e.examRoom.name
  }])).values()) as any[]

  // Calculer les statistiques
  const totalModules = updatedTeacherModules.length
  const totalStudents = updatedTeacherModules.reduce((sum, module) => sum + module.studentCount, 0)
  const totalCredits = updatedTeacherModules.reduce((sum, module) => sum + module.credits, 0)
  const upcomingExams = updatedTeacherModules.filter(m => m.examDate).length
  const supervisionCount = supervisionExams.length

  const getModuleStatus = (module: TeacherModule) => {
    if (module.examDate) {
      const examDate = new Date(module.examDate)
      const today = new Date()
      const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExam < 0) return { status: 'passed', color: 'bg-gray-500' }
      if (daysUntilExam <= 7) return { status: 'upcoming', color: 'bg-orange-500' }
      return { status: 'scheduled', color: 'bg-blue-500' }
    }
    return { status: 'no_exam', color: 'bg-gray-400' }
  }

  return (
    <AuthGuard requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Espace Professeur"
          subtitle="Gestion de vos enseignements et surveillances d'examens"
        />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Statistiques principales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalModules}</p>
                    <p className="text-sm text-muted-foreground">Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalCredits}</p>
                    <p className="text-sm text-muted-foreground">Crédits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{upcomingExams}</p>
                    <p className="text-sm text-muted-foreground">Examens</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{supervisionCount}</p>
                    <p className="text-sm text-muted-foreground">Surveillances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onglets principaux */}
          <Tabs defaultValue="modules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Mes Modules
              </TabsTrigger>
              <TabsTrigger value="supervision" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Surveillances
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planning
              </TabsTrigger>
            </TabsList>

            {/* Onglet Modules */}
            <TabsContent value="modules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Mes Enseignements
                  </CardTitle>
                  <CardDescription>
                    Liste des modules que vous enseignez ce semestre
                    {teacherData.scheduleStatus === 'published' && (
                      <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
                        Planning publié
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {updatedTeacherModules.map((module) => {
                      const status = getModuleStatus(module)
                      return (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedModule(module)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{module.name}</h3>
                              <Badge variant="outline">{module.code}</Badge>
                              <Badge className={status.color}>
                                {status.status === 'passed' ? 'Terminé' :
                                  status.status === 'upcoming' ? 'Prochain' :
                                    status.status === 'scheduled' ? 'Planifié' : 'Sans examen'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span>{module.formation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{module.studentCount} étudiants</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <span>{module.credits} crédits</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Semestre {module.semester}</span>
                              </div>
                            </div>

                            {module.examDate && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">
                                    Examen prévu le {format(new Date(module.examDate), "dd MMMM yyyy", { locale: fr })}
                                    {module.examRoom && ` - ${module.examRoom}`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Détails
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Graphique des charges de travail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Semestre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Semestre 1</span>
                          <span>{updatedTeacherModules.filter(m => m.semester === 1).length} modules</span>
                        </div>
                        <Progress
                          value={(updatedTeacherModules.filter(m => m.semester === 1).length / totalModules) * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Semestre 2</span>
                          <span>{updatedTeacherModules.filter(m => m.semester === 2).length} modules</span>
                        </div>
                        <Progress
                          value={(updatedTeacherModules.filter(m => m.semester === 2).length / totalModules) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques des Étudiants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold text-primary">
                          {totalModules > 0 ? Math.round(totalStudents / totalModules) : 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Moyenne par module</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {updatedTeacherModules.filter(m => m.studentCount >= 40).length}
                          </div>
                          <p className="text-xs text-green-800 dark:text-green-200">Modules pleins</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {totalModules > 0 ? Math.round(totalCredits / totalModules) : 0}
                          </div>
                          <p className="text-xs text-blue-800 dark:text-blue-200">Crédits moyens</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Surveillances */}
            <TabsContent value="supervision" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Surveillances d'Examens
                  </CardTitle>
                  <CardDescription>
                    Examens que vous devez surveiller en tant qu'enseignant
                    {teacherData.scheduleStatus === 'published' && (
                      <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
                        Planning publié
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {supervisionExams.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Module</TableHead>
                            <TableHead>Formation</TableHead>
                            <TableHead>Date & Heure</TableHead>
                            <TableHead>Salle</TableHead>
                            <TableHead>Étudiants</TableHead>
                            <TableHead>Professeur</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supervisionExams.map((exam: any) => (
                            <TableRow key={exam.id}>
                              <TableCell className="font-medium">{exam.moduleName}</TableCell>
                              <TableCell>{exam.formation}</TableCell>
                              <TableCell>
                                <div>
                                  <p>{format(new Date(exam.date), "dd/MM/yyyy")}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {exam.startTime} - {exam.endTime}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{exam.room}</TableCell>
                              <TableCell>{exam.studentCount}</TableCell>
                              <TableCell>{exam.professor}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Surveillance confirmée",
                                      description: `Votre présence pour l'examen de ${exam.moduleName} a été enregistrée.`,
                                    })
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirmer
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucune surveillance programmée</p>
                      <p className="text-sm">Vous n'avez pas d'examen à surveiller pour le moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistiques de surveillance */}
              {supervisionExams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {supervisionExams.reduce((sum: any, exam: { studentCount: any }) => sum + exam.studentCount, 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total étudiants surveillés</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {supervisionExams.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Examens à surveiller</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(supervisionExams.reduce((sum: any, exam: { studentCount: any }) => sum + exam.studentCount, 0) / supervisionExams.length)}
                        </div>
                        <p className="text-sm text-muted-foreground">Moyenne par examen</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Onglet Planning */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Planning Pédagogique
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble de votre emploi du temps académique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Cette semaine */}
                    <div>
                      <h4 className="font-medium mb-4">Cette semaine</h4>
                      <div className="space-y-3">
                        {updatedTeacherModules.slice(0, 2).map((module, index) => (
                          <div key={module.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="w-16 text-sm font-medium">
                              {['Lundi', 'Mardi', 'Mercredi'][index]}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{module.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {module.formation} - {module.studentCount} étudiants
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              09:00 - 11:00
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Examens à venir */}
                    <div>
                      <h4 className="font-medium mb-4">Examens à venir</h4>
                      <div className="space-y-3">
                        {updatedTeacherModules
                          .filter(m => m.examDate)
                          .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime())
                          .map((module) => (
                            <div key={module.id} className="flex items-center gap-4 p-3 border rounded-lg">
                              <div className="w-20 text-sm">
                                {format(new Date(module.examDate!), "dd/MM")}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{module.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {module.formation} - {module.examRoom}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {module.studentCount} étudiants
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Surveillances */}
                    <div>
                      <h4 className="font-medium mb-4">Surveillances programmées</h4>
                      <div className="space-y-3">
                        {supervisionExams.map((exam: { id: Key | null | undefined; date: string | number | Date; moduleName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; room: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; startTime: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; endTime: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
                          <div key={exam.id} className="flex items-center gap-4 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950">
                            <div className="w-20 text-sm">
                              {format(new Date(exam.date), "dd/MM")}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{exam.moduleName}</p>
                              <p className="text-sm text-muted-foreground">
                                Surveillance - {exam.room}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exam.startTime} - {exam.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
