"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, MapPin, Clock, User, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { generateStudentSchedulePDF } from "@/lib/pdf-generator"
import { getStudentPlanning } from "@/app/actions"

export default function StudentPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    async function fetchExams() {
      if (user?.email) {
        try {
          const data = await getStudentPlanning(user.email)
          if (data && data.exams) {
            const formattedExams = data.exams.map((e: any) => ({
              date: new Date(e.sessionDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
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
    }
    fetchExams()
  }, [user, toast])

  const totalExams = exams.length
  const totalHours = exams.reduce((sum, e) => sum + e.duration / 60, 0)
  const nextExamDays = 3 // To be calculated properly normally

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
        description: "Une erreur s'est produite.",
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
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Total Examens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-4">{totalExams}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Prochain Examen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-chart-4">--</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Heures Totales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-4">{Math.round(totalHours)}h</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Planning Détaillé</CardTitle>
                  <CardDescription>Vos examens à venir</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={isExporting || exams.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Export en cours..." : "Exporter PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">Chargement...</div>
              ) : exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.map((exam, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{exam.subject}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{exam.type}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {exam.duration} min
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{exam.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{exam.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{exam.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{exam.professor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">Aucun examen planifié</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
