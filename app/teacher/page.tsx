"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/hooks/use-auth"
import { getTeacherPlanning } from "@/app/actions"
import { ExamCalendar } from "@/components/exam-calendar"
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  Eye,
  FileText,
  Award,
  CalendarDays,
  List,
  MapPin
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
  id: string
  moduleName: string
  formation: string
  date: string
  isoDate: string
  startTime: string
  endTime: string
  time: string
  room: string
  studentCount: number
  professor: string
  subject: string
  type: string
  duration: number
}

export default function TeacherPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [teacherData, setTeacherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  useEffect(() => {
    async function fetchData() {
      if (user?.email) {
        try {
          const data = await getTeacherPlanning(user.email)
          setTeacherData(data)
        } catch (e) {
          console.error("Failed to fetch teacher planning", e)
          toast({
            title: "Erreur",
            description: "Impossible de charger vos données.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user, toast])

  if (loading) {
    return (
      <AuthGuard requiredRole="teacher">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Chargement de votre espace...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!teacherData) return null

  const supervisionExams: SupervisionExam[] = (teacherData.exams || []).map((e: any) => ({
    id: e.id,
    moduleName: e.module.name,
    formation: e.module.formation || "N/A",
    date: format(new Date(e.sessionDate), "dd MMMM yyyy", { locale: fr }),
    isoDate: e.sessionDate,
    startTime: e.startTime,
    endTime: e.endTime,
    time: `${e.startTime} - ${e.endTime}`,
    room: e.examRoom.name,
    studentCount: e.module.studentCount || 0,
    professor: `${teacherData.firstName} ${teacherData.lastName}`,
    subject: e.module.name,
    type: e.type,
    duration: e.duration
  }))

  const updatedTeacherModules = Array.from(new Map((teacherData.exams || []).map((e: any) => [e.module.id, {
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

  const totalModules = updatedTeacherModules.length
  const totalStudents = updatedTeacherModules.reduce((sum, module) => sum + (module.studentCount || 0), 0)
  const totalCredits = updatedTeacherModules.reduce((sum, module) => sum + (module.credits || 0), 0)
  const upcomingExams = updatedTeacherModules.filter(m => m.examDate).length
  const supervisionCount = supervisionExams.length

  const getModuleStatus = (module: TeacherModule) => {
    if (module.examDate) {
      const examDate = new Date(module.examDate)
      const today = new Date()
      const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilExam < 0) return { status: 'passed', color: 'bg-slate-500' }
      if (daysUntilExam <= 7) return { status: 'upcoming', color: 'bg-orange-500' }
      return { status: 'scheduled', color: 'bg-blue-500' }
    }
    return { status: 'no_exam', color: 'bg-slate-400' }
  }

  return (
    <AuthGuard requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Espace Professeur"
          subtitle={`Bienvenue, Prof. ${teacherData.lastName} - Gestion des enseignements et surveillances`}
        />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-blue-500/5 border-blue-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalModules}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/5 border-purple-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalCredits}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Crédits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/5 border-orange-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{upcomingExams}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Examens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-rose-500/5 border-rose-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-rose-500" />
                  <div>
                    <p className="text-2xl font-bold">{supervisionCount}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Surveillances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="modules" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Mes Modules
                </TabsTrigger>
                <TabsTrigger value="supervision" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Surveillances
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Planning
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="h-8 text-xs gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" /> Calendrier
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 text-xs gap-2"
                >
                  <List className="h-3.5 w-3.5" /> Liste
                </Button>
              </div>
            </div>

            <TabsContent value="modules" className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <BookOpen className="h-5 w-5 text-blue-500" /> Mes Enseignements
                  </CardTitle>
                  <CardDescription>
                    Liste des modules que vous enseignez ce semestre
                    {teacherData.scheduleStatus === 'published' && (
                      <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                        Planning publié
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {updatedTeacherModules.length > 0 ? updatedTeacherModules.map((module) => {
                      const status = getModuleStatus(module)
                      return (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-5 border border-slate-800 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 transition-all group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{module.name}</h3>
                              <Badge variant="outline" className="text-slate-400 border-slate-700">{module.code}</Badge>
                              <Badge className={`${status.color} text-white`}>
                                {status.status === 'passed' ? 'Terminé' :
                                  status.status === 'upcoming' ? 'Prochain' :
                                    status.status === 'scheduled' ? 'Planifié' : 'Sans examen'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-blue-500" />
                                <span>{module.formation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-500" />
                                <span>{module.studentCount} étudiants</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-purple-500" />
                                <span>{module.credits} crédits</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span>Semestre {module.semester}</span>
                              </div>
                            </div>
                            {module.examDate && (
                              <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-center gap-3 text-blue-400">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Examen validé le {format(new Date(module.examDate), "dd MMMM yyyy", { locale: fr })}
                                  {module.examRoom && <span className="text-slate-500 ml-2">à {module.examRoom}</span>}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <FileText className="h-4 w-4 mr-2" /> Détails
                          </Button>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun module assigné ou planning non encore validé.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supervision" className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Eye className="h-5 w-5 text-rose-500" /> Surveillances d'Examens
                  </CardTitle>
                  <CardDescription>
                    Examens validés par le Vice-Doyen pour lesquels vous êtes surveillant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {supervisionExams.length > 0 ? (
                    <ScrollArea className="h-[500px] pr-4">
                      <Table>
                        <TableHeader className="bg-slate-900/50">
                          <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-300">Module</TableHead>
                            <TableHead className="text-slate-300">Formation</TableHead>
                            <TableHead className="text-slate-300">Date & Heure</TableHead>
                            <TableHead className="text-slate-300">Salle</TableHead>
                            <TableHead className="text-slate-300">Étudiants</TableHead>
                            <TableHead className="text-right text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supervisionExams.map((exam: SupervisionExam) => (
                            <TableRow key={exam.id} className="border-slate-800 hover:bg-slate-800/30">
                              <TableCell className="font-semibold text-white">{exam.moduleName}</TableCell>
                              <TableCell className="text-slate-400">{exam.formation}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-slate-200">{exam.date}</p>
                                  <div className="flex items-center gap-1.5 text-xs text-blue-400">
                                    <Clock className="h-3 w-3" /> {exam.startTime} - {exam.endTime}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-purple-500/5 text-purple-400 border-purple-500/20">
                                    {exam.room}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-300">{exam.studentCount}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-slate-700 hover:bg-slate-800 text-xs"
                                >
                                  Confirmer
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                      <Eye className="h-16 w-16 mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-medium">Aucune surveillance pour le moment</p>
                      <p className="text-sm opacity-60 mt-1">Les surveillances apparaîtront après la publication globale.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              {viewMode === "calendar" ? (
                <div className="animate-in fade-in duration-500">
                  <ExamCalendar exams={supervisionExams} />
                </div>
              ) : (
                <Card className="border-slate-800 bg-slate-900/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Chronologie des Examens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {supervisionExams.length > 0 ? supervisionExams.map((exam: SupervisionExam, index: number) => (
                        <div key={index} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                              {index + 1}
                            </div>
                            {index < supervisionExams.length - 1 && <div className="w-px h-full bg-slate-800 mt-2" />}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/60 hover:border-slate-700 transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{exam.moduleName}</h4>
                                <Badge variant="outline">{exam.type}</Badge>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">{exam.formation}</p>
                              <div className="flex flex-wrap gap-4 text-sm font-medium">
                                <span className="flex items-center gap-1.5 text-blue-400">
                                  <Calendar className="h-4 w-4" /> {exam.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-orange-400">
                                  <Clock className="h-4 w-4" /> {exam.time}
                                </span>
                                <span className="flex items-center gap-1.5 text-purple-400">
                                  <MapPin className="h-4 w-4" /> {exam.room}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-20">
                          <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-10" />
                          <p className="text-slate-500">Planning vide ou non encore publié.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}