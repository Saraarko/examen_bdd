"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Eye
} from "lucide-react"
import mockData from "@/data/mock-data.json"

interface FormationDetailsModalProps {
  formation: {
    name: string
    exams: number
    status: string
    conflicts: number
    students: number
    modules: number
  }
  trigger?: React.ReactNode
}

interface Module {
  id: string
  name: string
  code: string
  credits: number
  semester: number
  exams: number
  professor?: string
}

interface Exam {
  id: number
  date: string
  time: string
  room: string
  professor: string
  students: number
  type: string
}

export function FormationDetailsModal({ formation, trigger }: FormationDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Données mockées pour les modules de cette formation
  const formationModules: Module[] = [
    {
      id: "1",
      name: "Algorithmique Avancée",
      code: "ALG201",
      credits: 6,
      semester: 1,
      exams: 1,
      professor: "Dr. Ahmed Martin"
    },
    {
      id: "2",
      name: "Bases de Données",
      code: "BDD202",
      credits: 5,
      semester: 1,
      exams: 1,
      professor: "Pr. Fatima Dubois"
    },
    {
      id: "3",
      name: "Programmation Orientée Objet",
      code: "POO203",
      credits: 6,
      semester: 2,
      exams: 1,
      professor: "Dr. Youssef Bennani"
    },
    {
      id: "4",
      name: "Réseaux Informatiques",
      code: "RES204",
      credits: 4,
      semester: 2,
      exams: 1,
      professor: "Pr. Amina Tazi"
    },
    {
      id: "5",
      name: "Intelligence Artificielle",
      code: "IA301",
      credits: 6,
      semester: 1,
      exams: 1,
      professor: "Dr. Karim Alaoui"
    }
  ]

  // Filtrer les examens de cette formation depuis les données mockées
  const formationExams: Exam[] = mockData.examens
    .filter(exam => exam.formation === formation.name)
    .map(exam => ({
      id: exam.id,
      date: exam.date,
      time: `${exam.heureDebut} - ${exam.heureFin}`,
      room: exam.salle,
      professor: exam.professeur,
      students: exam.nbEtudiants,
      type: exam.type
    }))

  // Calculer les statistiques
  const totalCredits = formationModules.reduce((sum, module) => sum + module.credits, 0)
  const plannedExams = formationExams.length
  const totalExamStudents = formationExams.reduce((sum, exam) => sum + exam.students, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Validé
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="outline">
            <FileText className="mr-1 h-3 w-3" />
            Brouillon
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Voir Détails
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            {formation.name}
          </DialogTitle>
          <DialogDescription>
            Détails complets de la formation et planification des examens
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Section Vue d'ensemble */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vue d'ensemble
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formation.students}</div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" />
                      Étudiants
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formation.modules}</div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Modules
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formation.exams}</div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Examens
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${formation.conflicts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formation.conflicts}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Conflits
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut de validation:</span>
                  {getStatusBadge(formation.status)}
                </div>

                {formation.conflicts > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {formation.conflicts} conflit{formation.conflicts > 1 ? 's' : ''} détecté{formation.conflicts > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Modules ({formation.modules})
                </CardTitle>
                <CardDescription>
                  Crédits totaux: {totalCredits} | Répartition par semestre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Semestre 1 */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Semestre 1</h4>
                    <div className="space-y-2">
                      {formationModules
                        .filter(module => module.semester === 1)
                        .map((module) => (
                          <div key={module.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{module.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {module.code}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Prof: {module.professor} • {module.credits} crédits
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {module.exams} examen{module.exams > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Semestre 2 */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Semestre 2</h4>
                    <div className="space-y-2">
                      {formationModules
                        .filter(module => module.semester === 2)
                        .map((module) => (
                          <div key={module.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{module.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {module.code}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Prof: {module.professor} • {module.credits} crédits
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {module.exams} examen{module.exams > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Examens planifiés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Examens Planifiés ({plannedExams})
                </CardTitle>
                <CardDescription>
                  {totalExamStudents} étudiants concernés au total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formationExams.length > 0 ? (
                  <div className="space-y-3">
                    {formationExams.map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{exam.date}</span>
                            <Badge variant="outline">{exam.type}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{exam.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{exam.room}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>{exam.professor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{exam.students}</div>
                          <p className="text-xs text-muted-foreground">étudiants</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun examen planifié pour cette formation.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression de Validation</CardTitle>
                <CardDescription>
                  État d'avancement de la planification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Modules avec examens planifiés</span>
                      <span>{Math.round((plannedExams / formation.modules) * 100)}%</span>
                    </div>
                    <Progress value={(plannedExams / formation.modules) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Couverture étudiants</span>
                      <span>{formation.students > 0 ? Math.round((totalExamStudents / formation.students) * 100) : 0}%</span>
                    </div>
                    <Progress
                      value={formation.students > 0 ? (totalExamStudents / formation.students) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  {formation.conflicts > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ {formation.conflicts} conflit{formation.conflicts > 1 ? 's' : ''} à résoudre avant validation finale
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
