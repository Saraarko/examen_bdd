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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Building,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OptimizationResult {
  category: string
  currentUsage: number
  optimizedUsage: number
  improvement: number
  status: 'improved' | 'maintained' | 'warning'
  details: string
}

interface ResourceOptimizationModalProps {
  trigger?: React.ReactNode
}

export function ResourceOptimizationModal({ trigger }: ResourceOptimizationModalProps) {
  const { toast } = useToast()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  // Données d'optimisation simulées
  const initialResults: OptimizationResult[] = [
    {
      category: "Occupation Amphithéâtres",
      currentUsage: 82,
      optimizedUsage: 89,
      improvement: 7,
      status: 'improved',
      details: "Réaffectation de 3 créneaux horaires pour maximiser l'utilisation"
    },
    {
      category: "Occupation Salles d'examen",
      currentUsage: 76,
      optimizedUsage: 84,
      improvement: 8,
      status: 'improved',
      details: "Regroupement des petits groupes dans des salles plus grandes"
    },
    {
      category: "Laboratoires",
      currentUsage: 83,
      optimizedUsage: 83,
      improvement: 0,
      status: 'maintained',
      details: "Déjà optimisé - aucune amélioration possible"
    },
    {
      category: "Salles TD",
      currentUsage: 73,
      optimizedUsage: 81,
      improvement: 8,
      status: 'improved',
      details: "Réduction des pauses entre sessions de 15 à 5 minutes"
    },
    {
      category: "Professeurs surveillants",
      currentUsage: 12.5,
      optimizedUsage: 11.8,
      improvement: -5.6,
      status: 'improved',
      details: "Meilleure distribution des surveillances entre enseignants"
    }
  ]

  const handleStartOptimization = async () => {
    setIsOptimizing(true)
    setIsCompleted(false)
    setOptimizationResults([])

    toast({
      title: "Optimisation en cours...",
      description: "Analyse des ressources et réallocation optimale en cours.",
    })

    // Simulation des étapes d'optimisation
    const steps = [
      "Analyse de l'occupation actuelle...",
      "Identification des goulots d'étranglement...",
      "Calcul des réallocations optimales...",
      "Validation des contraintes...",
      "Application des optimisations..."
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: `Étape ${i + 1}/${steps.length}`,
        description: steps[i],
      })
    }

    // Générer les résultats d'optimisation
    const results = initialResults.map(result => ({
      ...result,
      optimizedUsage: Math.max(70, Math.min(95, result.currentUsage + (Math.random() * 15 - 5))),
    })).map(result => ({
      ...result,
      improvement: Number(((result.optimizedUsage - result.currentUsage) / result.currentUsage * 100).toFixed(1)),
      status: result.optimizedUsage > result.currentUsage ? 'improved' as const :
              result.optimizedUsage === result.currentUsage ? 'maintained' as const : 'warning' as const
    }))

    setOptimizationResults(results)
    setIsOptimizing(false)
    setIsCompleted(true)

    const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length

    toast({
      title: "Optimisation terminée !",
      description: `Amélioration moyenne de ${avgImprovement.toFixed(1)}% sur toutes les ressources.`,
      variant: "default",
    })
  }

  const handleResetOptimization = () => {
    setOptimizationResults([])
    setIsCompleted(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'improved':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'maintained':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improved':
        return 'text-green-600'
      case 'maintained':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const overallImprovement = optimizationResults.length > 0
    ? optimizationResults.reduce((sum, r) => sum + r.improvement, 0) / optimizationResults.length
    : 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Détails Optimisation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            Optimisation des Ressources
          </DialogTitle>
          <DialogDescription>
            Analyse détaillée et optimisation automatique de l'utilisation des ressources universitaires
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Section Contrôles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Contrôles d'Optimisation
                </CardTitle>
                <CardDescription>
                  Lancez l'analyse automatique ou consultez les résultats précédents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {!isCompleted ? (
                    <Button
                      onClick={handleStartOptimization}
                      disabled={isOptimizing}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isOptimizing ? "Optimisation en cours..." : "Lancer l'optimisation"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResetOptimization}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Relancer l'analyse
                    </Button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Optimisation terminée</p>
                        <p className="text-xs text-green-600">
                          Amélioration: {overallImprovement.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section Résumé Global */}
            {isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé de l'Optimisation</CardTitle>
                  <CardDescription>
                    Amélioration globale de l'utilisation des ressources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {optimizationResults.filter(r => r.status === 'improved').length}
                      </div>
                      <p className="text-xs text-muted-foreground">Ressources améliorées</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        +{overallImprovement.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Amélioration moyenne</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {optimizationResults.filter(r => r.improvement > 5).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Améliorations &gt;5%</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {optimizationResults.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Ressources analysées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Détails par Ressource */}
            {optimizationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détail par Ressource</CardTitle>
                  <CardDescription>
                    Analyse détaillée des optimisations appliquées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <h4 className="font-medium">{result.category}</h4>
                            <Badge
                              variant={result.status === 'improved' ? 'default' :
                                     result.status === 'warning' ? 'destructive' : 'secondary'}
                            >
                              {result.improvement > 0 ? '+' : ''}{result.improvement.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Avant:</span>
                              <span className="font-medium">{result.currentUsage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Après:</span>
                              <span className="font-medium text-primary">{result.optimizedUsage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{result.details}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Utilisation actuelle</span>
                            <span>Utilisation optimisée</span>
                          </div>
                          <div className="relative">
                            <Progress
                              value={result.currentUsage}
                              className="h-2 bg-muted"
                            />
                            <div
                              className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-1000"
                              style={{ width: `${result.optimizedUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Informations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Comment fonctionne l'optimisation ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>Analyse prédictive :</strong> L'algorithme analyse les patterns d'utilisation
                    historique pour prévoir les besoins futurs.
                  </p>
                  <p>
                    <strong>Équilibrage automatique :</strong> Répartition intelligente des ressources
                    pour éviter les surcharges et les sous-utilisations.
                  </p>
                  <p>
                    <strong>Respect des contraintes :</strong> Toutes les règles métier (capacités,
                    disponibilités, priorités) sont préservées.
                  </p>
                  <p>
                    <strong>Optimisation temps réel :</strong> Ajustements dynamiques basés sur
                    les réservations en cours.
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
