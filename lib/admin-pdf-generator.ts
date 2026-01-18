import jsPDF from 'jspdf'
interface AdminStats {
  totalExams: number
  totalConflicts: number
  totalStudents: number
  totalDepartments: number
  totalFormations: number
  totalProfessors: number
  averageGenerationTime: number
  optimizationScore: number
}
interface ConflictData {
  id: number
  type: string
  severity: string
  message: string
  department: string
  details: string
}
interface ResourceData {
  name: string
  total: number
  used: number
  utilization: number
}
export function generateAdminReportPDF(
  stats: AdminStats,
  conflicts: ConflictData[],
  resources: ResourceData[],
  sessionName: string = "Janvier 2025"
) {
  const pdf = new jsPDF()
  const primaryColor = [0, 123, 255]
  const secondaryColor = [52, 58, 64]
  const successColor = [40, 167, 69]
  const warningColor = [255, 193, 7]
  const dangerColor = [220, 53, 69]
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.rect(0, 0, 210, 30, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('UMBB Faculté de Science', 105, 15, { align: 'center' })
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Rapport Administratif - Session d\'Examens', 105, 22, { align: 'center' })
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Rapport de Gestion ${sessionName}`, 105, 45, { align: 'center' })
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  let yPosition = 60
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.5)
  pdf.rect(20, yPosition - 5, 170, 30)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Informations Générales:', 25, yPosition)
  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Session: ${sessionName}`, 25, yPosition)
  pdf.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 110, yPosition)
  yPosition += 6
  pdf.text(`Total Étudiants: ${stats.totalStudents.toLocaleString()}`, 25, yPosition)
  pdf.text(`Total Départements: ${stats.totalDepartments}`, 110, yPosition)
  yPosition += 6
  pdf.text(`Total Formations: ${stats.totalFormations}`, 25, yPosition)
  pdf.text(`Total Professeurs: ${stats.totalProfessors}`, 110, yPosition)
  yPosition += 20
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('Statistiques de Performance:', 20, yPosition)
  yPosition += 10
  pdf.setFontSize(11)
  const metrics = [
    { label: 'Examens Planifiés', value: stats.totalExams, unit: '' },
    { label: 'Conflits Détectés', value: stats.totalConflicts, unit: '' },
    { label: 'Temps Génération Moyen', value: stats.averageGenerationTime, unit: 's' },
    { label: 'Score Optimisation', value: stats.optimizationScore, unit: '%' }
  ]
  let colX = 20
  const colWidth = 45
  metrics.forEach((metric, index) => {
    if (index > 0 && index % 2 === 0) {
      yPosition += 15
      colX = 20
    }
    pdf.setDrawColor(240, 240, 240)
    pdf.setFillColor(248, 249, 250)
    pdf.rect(colX, yPosition - 3, colWidth, 12, 'F')
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${metric.value}${metric.unit}`, colX + 2, yPosition + 2)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text(metric.label, colX + 2, yPosition + 7)
    colX += colWidth + 5
  })
  yPosition += 25
  if (yPosition > 250) {
    pdf.addPage()
    yPosition = 30
  }
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('État des Ressources:', 20, yPosition)
  yPosition += 10
  pdf.setFontSize(10)
  resources.forEach((resource, index) => {
    if (yPosition > 260) {
      pdf.addPage()
      yPosition = 30
    }
    pdf.setDrawColor(200, 200, 200)
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, yPosition - 2, 120, 8, 'F')
    const fillColor = resource.utilization > 80 ? dangerColor :
                     resource.utilization > 60 ? warningColor : successColor
    pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    pdf.rect(20, yPosition - 2, (120 * resource.utilization) / 100, 8, 'F')
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.text(resource.name, 25, yPosition + 3)
    pdf.text(`${resource.used}/${resource.total}`, 110, yPosition + 3)
    pdf.text(`${resource.utilization}%`, 140, yPosition + 3)
    yPosition += 12
  })
  yPosition += 10
  if (conflicts.length > 0 && yPosition < 200) {
    if (yPosition > 180) {
      pdf.addPage()
      yPosition = 30
    }
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Conflits Détectés:', 20, yPosition)
    yPosition += 10
    pdf.setFontSize(9)
    conflicts.slice(0, 5).forEach((conflict, index) => {
      if (yPosition > 260) {
        pdf.addPage()
        yPosition = 30
      }
      const severityColor = conflict.severity === 'haute' ? dangerColor :
                           conflict.severity === 'moyenne' ? warningColor : [100, 100, 100]
      pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2])
      pdf.rect(20, yPosition - 2, 30, 6, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text(conflict.severity.toUpperCase(), 22, yPosition + 2)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.text(conflict.type, 55, yPosition + 2)
      pdf.text(conflict.department, 85, yPosition + 2)
      yPosition += 6
      const message = conflict.message.length > 80 ?
        conflict.message.substring(0, 77) + '...' : conflict.message
      pdf.text(message, 25, yPosition + 2)
      yPosition += 8
    })
    if (conflicts.length > 5) {
      pdf.setFont('helvetica', 'italic')
      pdf.text(`... et ${conflicts.length - 5} autres conflits`, 25, yPosition)
    }
  }
  const pageHeight = pdf.internal.pageSize.height
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text('Rapport généré automatiquement par le système de gestion des examens', 105, pageHeight - 20, { align: 'center' })
  pdf.text('UMBB Faculté de Science - © 2025', 105, pageHeight - 10, { align: 'center' })
  const fileName = `rapport-admin-${sessionName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  pdf.save(fileName)
}
