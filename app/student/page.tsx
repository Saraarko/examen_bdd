"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, MapPin, Clock, User, Download, List, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { generateStudentSchedulePDF } from "@/lib/pdf-generator"
import { getStudentPlanning } from "@/app/actions"
import { ExamCalendar } from "@/components/exam-calendar"

export default function StudentPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  useEffect(() => {
    async function fetchExams() {
      if (!user?.email) {
        if (user) setLoading(false) // Stop loading if user exists but has no email (shouldn't happen with AuthGuard)
        return
      }

      try {
        const data = await getStudentPlanning(user.email)
        if (data && data.exams) {
          const formattedExams = data.exams.map((e: any) => ({
            date: new Date(e.sessionDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            isoDate: e.isoDate,
            time: `${e.startTime} - ${e.endTime}`,
            subject: e.module.name,
            room: e.examRoom.name,
            professor: `${e.professor.firstName} ${e.professor.lastName}`,
            type: e.type,
            duration: e.duration,
          }))
          setExams(formattedExams)
          setSelectedFormation(data.formation?.name || "Formation inconnue")
        }
      } catch (error) {
        console.error("Failed to fetch exams", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger votre planning.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [user, toast])

  const totalExams = exams.length
  const totalHours = exams.reduce((sum, e) => sum + e.duration / 60, 0)

  const handleExportPDF = async () => {
    if (!user) return
    setIsExporting(true)
    toast({
      title: "Export en cours...",
      description: "Génération de votre planning personnel au format PDF.",
    })
    try {
      await generateStudentSchedulePDF(user, exams, selectedFormation)
      toast({
        title: "Planning exporté avec succès !",
        description: `Votre planning d'examens (${selectedFormation}) a été téléchargé.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Erreur export PDF:", error)
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de la génération du PDF.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Mon Planning d'Examens"
          subtitle={`${selectedFormation} - Session Janvier 2025`}
        />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-blue-400">Total Examens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-white">{totalExams}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-purple-400">Session Actuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-white">Janvier 2025</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Heures Totales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-white">{Math.round(totalHours)}h</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Vues du Planning</h2>
              <p className="text-slate-400 text-sm">Gérez et visualisez vos dates d'examens</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "rounded-lg transition-all",
                    viewMode === "calendar" ? "bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-500 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendrier
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-lg transition-all",
                    viewMode === "list" ? "bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-500 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <List className="h-4 w-4 mr-2" />
                  Liste
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting || exams.length === 0}
                className="rounded-xl border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Chargement..." : "Exporter PDF"}
              </Button>
            </div>
          </div>

          {viewMode === "calendar" && (
            <div className="mb-8 animate-in fade-in duration-500">
              {loading ? (
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <p className="text-slate-400 font-medium">Chargement de votre planning...</p>
                  </div>
                </div>
              ) : (
                <ExamCalendar exams={exams} />
              )}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {loading ? (
                <div className="text-center py-12">Chargement...</div>
              ) : exams.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {exams.map((exam, index) => (
                    <Card key={index} className="overflow-hidden border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {exam.type}
                              </Badge>
                              <span className="text-slate-500 text-xs font-mono">{exam.duration} min</span>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{exam.subject}</h3>
                            <div className="flex flex-wrap gap-4 pt-1">
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Calendar className="h-4 w-4 text-blue-400" />
                                <span>{exam.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span>{exam.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800 min-w-[200px]">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <MapPin className="h-4 w-4 text-purple-400" />
                              <span className="font-semibold">{exam.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <User className="h-4 w-4 text-emerald-400" />
                              <span className="truncate">{exam.professor}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-slate-800 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <CalendarDays className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-xl font-medium">Aucun examen planifié pour le moment</p>
                    <p className="text-sm">Vérifiez plus tard ou contactez votre administration.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}