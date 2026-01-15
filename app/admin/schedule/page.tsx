"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import {
  getExams,
  createExam,
  updateExamAction,
  deleteExamAction,
  submitAllDraftExams,
  generateAutoSchedule,
  optimizeConflictsAction
} from "@/app/actions"
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useEffect } from "react"

interface Exam {
  id: number
  moduleId: number
  moduleName: string
  formation: string
  department: string
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  examRoomId: number
  room: string
  professorId: number
  professor: string
  studentCount: number
  type: string
  status: 'DRAFT' | 'PENDING_CHEF' | 'PENDING_DEAN' | 'PUBLISHED'
}

interface Professor {
  id: number
  name: string
}

interface Room {
  id: number
  name: string
  capacite: number
}

interface DBData {
  departments: string[]
  rooms: Room[]
  professors: Professor[]
  formations: string[]
  modules: { id: number; name: string; code: string }[]
}

interface NewExamForm {
  moduleId: string
  formationId: string
  departmentId: string
  date: Date | undefined
  startTime: string
  endTime: string
  roomId: string
  professorId: string
  studentCount: number
  type: string
}

export default function AdminSchedulePage() {
  const { toast } = useToast()

  const [dbData, setDbData] = useState<DBData>({
    departments: [],
    rooms: [],
    professors: [],
    formations: [],
    modules: []
  })

  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const refreshData = async () => {
    setLoading(true)
    try {
      const [dataRes, examsData] = await Promise.all([
        fetch("/api/admin/schedule/data").then(res => res.json()),
        getExams()
      ])
      setDbData(dataRes)
      setExams(examsData as any)
    } catch (err) {
      console.error("Error loading schedule data:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    setMounted(true)
  }, [])

  const departments = dbData.departments
  const rooms = dbData.rooms
  const professors = dbData.professors
  const formations = dbData.formations
  const modules = dbData.modules

  // Si pas d'examens générés, commencer avec une liste vide (ou fetch depuis DB si on implèmentera getExams)
  const displayExams = exams

  const [isAddingExam, setIsAddingExam] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [newExam, setNewExam] = useState<NewExamForm>({
    moduleId: '',
    formationId: '',
    departmentId: '',
    date: undefined,
    startTime: '',
    endTime: '',
    roomId: '',
    professorId: '',
    studentCount: 0,
    type: 'Écrit'
  })

  const examTypes = ["Écrit", "Oral", "TP", "Projet"]

  const handleAddExam = async () => {
    if (!newExam.moduleId || !newExam.date || !newExam.startTime || !newExam.endTime ||
      !newExam.roomId || !newExam.professorId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    // Client-side conflict check (optional)
    const conflict = checkForConflicts(newExam)
    if (conflict) {
      toast({
        title: "Conflit détecté",
        description: conflict,
        variant: "destructive",
      })
      return
    }

    try {
      await createExam({
        moduleId: parseInt(newExam.moduleId),
        examRoomId: parseInt(newExam.roomId),
        professorId: parseInt(newExam.professorId),
        sessionDate: format(newExam.date, 'yyyy-MM-dd'),
        startTime: newExam.startTime,
        endTime: newExam.endTime,
        duration: calculateDuration(newExam.startTime, newExam.endTime),
        type: newExam.type
      })

      toast({
        title: "Examen ajouté",
        description: "L'examen a été enregistré en tant que brouillon.",
      })
      setIsAddingExam(false)
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'examen.",
        variant: "destructive"
      })
    }
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setNewExam({
      moduleId: exam.moduleId.toString(),
      formationId: "", // Not strictly needed for edit
      departmentId: "",
      date: new Date(exam.sessionDate),
      startTime: exam.startTime,
      endTime: exam.endTime,
      roomId: exam.examRoomId.toString(),
      professorId: exam.professorId.toString(),
      studentCount: exam.studentCount,
      type: exam.type
    })
  }

  const handleUpdateExam = async () => {
    if (!editingExam) return

    try {
      await updateExamAction(editingExam.id, {
        moduleId: parseInt(newExam.moduleId),
        examRoomId: parseInt(newExam.roomId),
        professorId: parseInt(newExam.professorId),
        sessionDate: format(newExam.date!, 'yyyy-MM-dd'),
        startTime: newExam.startTime,
        endTime: newExam.endTime,
        duration: calculateDuration(newExam.startTime, newExam.endTime),
        type: newExam.type,
        status: editingExam.status
      })

      toast({
        title: "Examen modifié",
        description: "Mise à jour réussie.",
      })
      setEditingExam(null)
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'examen.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteExam = async (examId: number) => {
    try {
      await deleteExamAction(examId)
      toast({
        title: "Examen supprimé",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        variant: "destructive"
      })
    }
  }

  const handleSubmitAll = async () => {
    try {
      await submitAllDraftExams()
      toast({
        title: "Schedules soumis",
        description: "Tous les brouillons ont été envoyés aux chefs de département.",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        variant: "destructive"
      })
    }
  }

  const handleAutoGenerate = async () => {
    setLoading(true)
    try {
      const result: any = await generateAutoSchedule()
      if (result.success) {
        toast({
          title: "Génération réussie",
          description: `${result.count} examens ont été générés.`,
        })
        refreshData()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la génération automatique.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOptimizeConflicts = async () => {
    setLoading(true)
    try {
      const result: any = await optimizeConflictsAction()
      if (result.success) {
        toast({
          title: "Optimisation terminée",
          description: `${result.optimizedCount} conflits ont été résolus.`,
        })
        refreshData()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'optimisation des conflits.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }


  const checkForConflicts = (newExamData: NewExamForm, existingExams = exams): string | null => {
    const examDate = newExamData.date ? format(newExamData.date, 'yyyy-MM-dd') : ''

    // Vérifier conflits de salle
    const roomConflict = existingExams.find(exam =>
      exam.sessionDate === examDate &&
      exam.examRoomId.toString() === newExamData.roomId &&
      (
        (newExamData.startTime >= exam.startTime && newExamData.startTime < exam.endTime) ||
        (newExamData.endTime > exam.startTime && newExamData.endTime <= exam.endTime) ||
        (newExamData.startTime <= exam.startTime && newExamData.endTime >= exam.endTime)
      )
    )

    if (roomConflict) {
      return `Conflit de salle: ${roomConflict.room} occupée par ${roomConflict.moduleName}`
    }

    // Vérifier conflits de professeur
    const professorConflict = existingExams.find(exam =>
      exam.sessionDate === examDate &&
      exam.professorId.toString() === newExamData.professorId &&
      (
        (newExamData.startTime >= exam.startTime && newExamData.startTime < exam.endTime) ||
        (newExamData.endTime > exam.startTime && newExamData.endTime <= exam.endTime) ||
        (newExamData.startTime <= exam.startTime && newExamData.endTime >= exam.endTime)
      )
    )

    if (professorConflict) {
      return `Conflit de professeur: ${professorConflict.professor} occupé par ${professorConflict.moduleName}`
    }

    // Vérifier capacité de la salle
    const selectedRoom = rooms.find(r => r.id.toString() === newExamData.roomId)
    if (selectedRoom && newExamData.studentCount > selectedRoom.capacite) {
      return `Capacité insuffisante: ${selectedRoom.name} ne peut accueillir que ${selectedRoom.capacite} étudiants`
    }

    return null
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500/10 text-green-500">Publié</Badge>
      case 'PENDING_DEAN':
        return <Badge className="bg-purple-500/10 text-purple-500">En attente Doyen</Badge>
      case 'PENDING_CHEF':
        return <Badge className="bg-blue-500/10 text-blue-500">En attente Chef</Badge>
      default:
        return <Badge variant="outline">Brouillon</Badge>
    }
  }

  const confirmedExams = exams.filter(e => e.status === 'PUBLISHED').length
  const plannedExams = exams.filter(e => e.status === 'DRAFT').length
  const totalStudents = exams.reduce((sum, exam) => sum + (Number(exam.studentCount) || 0), 0)

  if (!mounted) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Hydratation en cours...</p>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Planification Manuelle"
          subtitle="Gestion détaillée des examens et conflits"
        />

        <div className="container mx-auto px-4 py-8">
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Chargement du planning...</p>
              </div>
            </div>
          )}
          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{exams.length}</p>
                    <p className="text-sm text-muted-foreground">Examens totaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{confirmedExams}</p>
                    <p className="text-sm text-muted-foreground">Confirmés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{plannedExams}</p>
                    <p className="text-sm text-muted-foreground">Planifiés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions principales */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Gestion des Examens</h2>
              <p className="text-muted-foreground">
                Planifiez, modifiez et validez manuellement les examens
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAutoGenerate}
                className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Générer automatiquement
              </Button>

              <Button
                variant="outline"
                onClick={handleOptimizeConflicts}
                className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Optimiser les conflits
              </Button>

              <Button
                variant="outline"
                onClick={handleSubmitAll}
                disabled={!exams.some(e => e.status === 'DRAFT')}
                className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Soumettre tout
              </Button>

              <Dialog open={isAddingExam} onOpenChange={setIsAddingExam}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter Examen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel examen</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour planifier un nouvel examen
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moduleId">Module *</Label>
                      <Select value={newExam.moduleId} onValueChange={(value) => setNewExam(prev => ({ ...prev, moduleId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map((m: any) => (
                            <SelectItem key={m.id} value={m.id.toString()}>
                              {m.code} - {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newExam.date ? format(newExam.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newExam.date}
                            onSelect={(date) => setNewExam(prev => ({ ...prev, date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Heure de début *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newExam.startTime}
                        onChange={(e) => setNewExam(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">Heure de fin *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newExam.endTime}
                        onChange={(e) => setNewExam(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room">Salle *</Label>
                      <Select value={newExam.roomId} onValueChange={(value) => setNewExam(prev => ({ ...prev, roomId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une salle" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.name} (Cap: {room.capacite})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="professor">Professeur *</Label>
                      <Select value={newExam.professorId} onValueChange={(value) => setNewExam(prev => ({ ...prev, professorId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un professeur" />
                        </SelectTrigger>
                        <SelectContent>
                          {professors.map((prof: Professor) => (
                            <SelectItem key={prof.id} value={prof.id.toString()}>
                              {prof.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentCount">Nombre d'étudiants</Label>
                      <Input
                        id="studentCount"
                        type="number"
                        value={newExam.studentCount}
                        onChange={(e) => setNewExam(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
                        placeholder="Ex: 45"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type d'examen</Label>
                      <Select value={newExam.type} onValueChange={(value) => setNewExam(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddingExam(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddExam}>
                      <Save className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
            </div>
          </div>

          {/* Tableau des examens */}
          <Card>
            <CardHeader>
              <CardTitle>Examens Planifiés</CardTitle>
              <CardDescription>
                Liste complète des examens avec statut et actions disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Formation</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Professeur</TableHead>
                      <TableHead>Étudiants</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{exam.moduleName}</p>
                            <Badge variant="outline" className="text-xs">{exam.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{exam.formation}</p>
                            <p className="text-sm text-muted-foreground">{exam.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p>{format(new Date(exam.sessionDate), "dd/MM/yyyy")}</p>
                              <p className="text-sm text-muted-foreground">
                                {exam.startTime} - {exam.endTime}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.room}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.professor}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(exam.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditExam(exam)}
                              disabled={exam.status !== 'DRAFT'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteExam(exam.id)}
                              disabled={exam.status !== 'DRAFT'}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Modal d'édition */}
          {editingExam && (
            <Dialog open={!!editingExam} onOpenChange={() => setEditingExam(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier l'examen</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations de l'examen sélectionné
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-moduleId">Module *</Label>
                    <Select value={newExam.moduleId} onValueChange={(value) => setNewExam(prev => ({ ...prev, moduleId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((m: any) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.code} - {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newExam.date ? format(newExam.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newExam.date}
                          onSelect={(date) => setNewExam(prev => ({ ...prev, date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime">Heure de début *</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={newExam.startTime}
                      onChange={(e) => setNewExam(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime">Heure de fin *</Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={newExam.endTime}
                      onChange={(e) => setNewExam(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-room">Salle *</Label>
                    <Select value={newExam.roomId} onValueChange={(value) => setNewExam(prev => ({ ...prev, roomId: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} (Cap: {room.capacite})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setEditingExam(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateExam}>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
