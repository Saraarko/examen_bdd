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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Play,
  RotateCcw,
  XCircle,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Conflict {
  id: number
  type: string
  severity: string
  message: string
  department: string
  details: string
}

interface ResolutionResult {
  conflictId: number
  status: 'resolved' | 'failed' | 'manual_required'
  method: string
  details: string
}

interface AutoResolveModalProps {
  conflicts: Conflict[]
  onConflictsResolved?: (results: ResolutionResult[]) => void
  trigger?: React.ReactNode
}

export function AutoResolveModal({ conflicts = [], onConflictsResolved, trigger }: AutoResolveModalProps) {
  const { toast } = useToast()
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionStep, setResolutionStep] = useState(0)
  const [results, setResults] = useState<ResolutionResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const resolutionSteps = [
    "Analyse des conflits...",
    "Classification par priorité...",
    "Application des règles de résolution...",
    "Validation des solutions...",
    "Finalisation des modifications..."
  ]

  const handleStartResolution = async () => {
    setIsResolving(true)
    setResolutionStep(0)
    setResults([])
    setIsCompleted(false)

    toast({
      title: "Résolution automatique démarrée",
      description: "Analyse et résolution automatique des conflits en cours.",
    })

    // Simuler les étapes de résolution
    for (let i = 0; i < resolutionSteps.length; i++) {
      setResolutionStep(i)
      await new Promise(resolve => setTimeout(resolve, 800))

      toast({
        title: `Étape ${i + 1}/${resolutionSteps.length}`,
        description: resolutionSteps[i],
      })
    }

    // Générer des résultats simulés
    const mockResults: ResolutionResult[] = conflicts.map(conflict => {
      const random = Math.random()
      let status: 'resolved' | 'failed' | 'manual_required'
      let method: string
      let details: string

      if (random < 0.7) {
        // 70% de succès
        status = 'resolved'
        method = getResolutionMethod(conflict.type)
        details = `Résolu automatiquement par ${method}`
      } else if (random < 0.85) {
        // 15% d'échec
        status = 'failed'
        method = 'Échec de résolution automatique'
        details = 'Conflit trop complexe pour résolution automatique'
      } else {
        // 15% nécessite intervention manuelle
        status = 'manual_required'
        method = 'Intervention manuelle requise'
        details = 'Résolution partielle - ajustements manuels nécessaires'
      }

      return {
        conflictId: conflict.id,
        status,
        method,
        details
      }
    })

    setResults(mockResults)
    setIsResolving(false)
    setIsCompleted(true)

    const resolvedCount = mockResults.filter(r => r.status === 'resolved').length
    const failedCount = mockResults.filter(r => r.status === 'failed').length
    const manualCount = mockResults.filter(r => r.status === 'manual_required').length

    toast({
      title: "Résolution automatique terminée",
      description: `${resolvedCount} résolus, ${manualCount} nécessitent intervention, ${failedCount} échoués.`,
      variant: resolvedCount > 0 ? "default" : "destructive",
    })

    // Appeler le callback si fourni
    if (onConflictsResolved) {
      onConflictsResolved(mockResults)
    }
  }

  const getResolutionMethod = (conflictType: string): string => {
    const methods: Record<string, string> = {
      'Salle': 'Réallocation de salle',
      'Professeur': 'Réajustement des horaires',
      'Étudiant': 'Regroupement de sessions',
      'Capacité': 'Répartition des étudiants',
      'Horaire': 'Décalage temporel'
    }
    return methods[conflictType] || 'Méthode automatique'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'manual_required':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'manual_required':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const resolvedCount = results.filter(r => r.status === 'resolved').length
  const failedCount = results.filter(r => r.status === 'failed').length
  const manualCount = results.filter(r => r.status === 'manual_required').length
  const successRate = conflicts.length > 0 ? Math.round((resolvedCount / conflicts.length) * 100) : 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Auto-résoudre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            Résolution Automatique des Conflits
          </DialogTitle>
          <DialogDescription>
            Système intelligent de résolution automatique des conflits d'examens
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Section État et Contrôles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  État de la Résolution
                </CardTitle>
                <CardDescription>
                  {conflicts.length} conflit(s) détecté(s) • Taux de réussite estimé: 70%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {!isCompleted ? (
                    <Button
                      onClick={handleStartResolution}
                      disabled={isResolving || conflicts.length === 0}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isResolving ? "Résolution en cours..." : "Démarrer la résolution"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setResults([])
                        setIsCompleted(false)
                        setResolutionStep(0)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Relancer l'analyse
                    </Button>
                  )}

                  {conflicts.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Aucun conflit détecté</span>
                    </div>
                  )}
                </div>

                {/* Barre de progression pendant la résolution */}
                {isResolving && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Étape {resolutionStep + 1}/{resolutionSteps.length}</span>
                      <span>{Math.round(((resolutionStep + 1) / resolutionSteps.length) * 100)}%</span>
                    </div>
                    <Progress value={((resolutionStep + 1) / resolutionSteps.length) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground">{resolutionSteps[resolutionStep]}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Résultats */}
            {isCompleted && results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résultats de la Résolution</CardTitle>
                  <CardDescription>
                    Taux de réussite: {successRate}% • {resolvedCount}/{conflicts.length} conflits résolus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Statistiques globales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                      <p className="text-xs text-green-800">Résolus</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{manualCount}</div>
                      <p className="text-xs text-yellow-800">Intervention manuelle</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                      <p className="text-xs text-red-800">Échoués</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                      <p className="text-xs text-blue-800">Taux de succès</p>
                    </div>
                  </div>

                  {/* Liste détaillée des résultats */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Détail par conflit:</h4>
                    {results.map((result, index) => {
                      const conflict = conflicts.find(c => c.id === result.conflictId)
                      if (!conflict) return null

                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(result.status)}
                              <span className="font-medium text-sm">{conflict.type}</span>
                              <Badge variant="outline" className="text-xs">
                                {conflict.department}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{conflict.message}</p>
                            <p className={`text-xs ${getStatusColor(result.status)}`}>
                              {result.details}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Informations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Comment fonctionne la résolution automatique ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>Analyse intelligente :</strong> Le système analyse chaque conflit pour déterminer
                    la meilleure stratégie de résolution.
                  </p>
                  <p>
                    <strong>Règles prioritaires :</strong> Les conflits sont résolus selon des règles métier
                    prédéfinies (priorité départementale, capacité des salles, etc.).
                  </p>
                  <p>
                    <strong>Résolution progressive :</strong> Les solutions simples sont appliquées en premier,
                    les cas complexes sont signalés pour intervention manuelle.
                  </p>
                  <p>
                    <strong>Validation automatique :</strong> Chaque résolution est validée pour s'assurer
                    qu'elle ne crée pas de nouveaux conflits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
