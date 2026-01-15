import jsPDF from 'jspdf'
import { User } from '@/hooks/use-auth'

interface ExamData {
  date: string
  time: string
  subject: string
  room: string
  professor: string
  type: string
  duration: number
}

export function generateStudentSchedulePDF(
  user: User,
  exams: ExamData[],
  formation: string
) {
  const pdf = new jsPDF()

  // Couleurs et styles
  const primaryColor = [0, 123, 255] // Bleu
  const secondaryColor = [52, 58, 64] // Gris foncé
  const accentColor = [40, 167, 69] // Vert

  // En-tête de l'université
  pdf.setFillColor(0, 123, 255)
  pdf.rect(0, 0, 210, 30, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('UMBB Faculté de Science', 105, 15, { align: 'center' })

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Système de Gestion des Examens', 105, 22, { align: 'center' })

  // Titre du document
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Emploi du Temps des Examens', 105, 45, { align: 'center' })

  // Informations de l'étudiant
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  let yPosition = 60

  // Cadre d'informations
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.5)
  pdf.rect(20, yPosition - 5, 170, 35)

  pdf.setFont('helvetica', 'bold')
  pdf.text('Informations Étudiant:', 25, yPosition)

  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Nom: ${user.name}`, 25, yPosition)
  pdf.text(`Formation: ${formation}`, 110, yPosition)

  yPosition += 6
  pdf.text(`Email: ${user.email || `${user.id}@univ.ma`}`, 25, yPosition)
  if (user.department) {
    pdf.text(`Département: ${user.department}`, 110, yPosition)
  }

  yPosition += 6
  const currentDate = new Date().toLocaleDateString('fr-FR')
  pdf.text(`Généré le: ${currentDate}`, 25, yPosition)

  yPosition += 20

  // Statistiques
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('Résumé:', 20, yPosition)

  yPosition += 6
  pdf.setFont('helvetica', 'normal')
  const totalExams = exams.length
  const totalHours = exams.reduce((sum, exam) => sum + exam.duration / 60, 0)

  pdf.text(`Nombre d'examens: ${totalExams}`, 20, yPosition)
  pdf.text(`Durée totale: ${Math.round(totalHours)}h`, 80, yPosition)
  pdf.text(`Session: Janvier 2025`, 140, yPosition)

  yPosition += 15

  // Tableau des examens
  if (exams.length > 0) {
    // En-tête du tableau
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, yPosition - 3, 170, 8, 'F')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    pdf.text('Date', 22, yPosition)
    pdf.text('Heure', 45, yPosition)
    pdf.text('Matière', 65, yPosition)
    pdf.text('Salle', 125, yPosition)
    pdf.text('Professeur', 145, yPosition)

    yPosition += 8

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, yPosition - 2, 190, yPosition - 2)

    // Données des examens
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    exams.forEach((exam, index) => {
      // Alternance de couleur pour les lignes
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, yPosition - 4, 170, 6, 'F')
      }

      pdf.text(exam.date, 22, yPosition)
      pdf.text(exam.time, 45, yPosition)

      // Gestion du texte long pour la matière
      const subjectText = exam.subject.length > 20 ? exam.subject.substring(0, 17) + '...' : exam.subject
      pdf.text(subjectText, 65, yPosition)

      pdf.text(exam.room, 125, yPosition)

      // Gestion du texte long pour le professeur
      const profText = exam.professor.length > 15 ? exam.professor.substring(0, 12) + '...' : exam.professor
      pdf.text(profText, 145, yPosition)

      yPosition += 6

      // Vérifier si on atteint le bas de la page
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 30

        // Recommencer l'en-tête du tableau sur la nouvelle page
        pdf.setFillColor(240, 240, 240)
        pdf.rect(20, yPosition - 3, 170, 8, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.text('Date', 22, yPosition)
        pdf.text('Heure', 45, yPosition)
        pdf.text('Matière', 65, yPosition)
        pdf.text('Salle', 125, yPosition)
        pdf.text('Professeur', 145, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
      }
    })
  } else {
    // Aucun examen
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text('Aucun examen planifié pour cette période.', 105, yPosition + 10, { align: 'center' })
  }

  // Pied de page
  const pageHeight = pdf.internal.pageSize.height
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text('Document généré automatiquement par le système de gestion des examens', 105, pageHeight - 20, { align: 'center' })
  pdf.text('UMBB Faculté de Science - © 2025', 105, pageHeight - 10, { align: 'center' })

  // Générer le nom du fichier
  const fileName = `emploi-temps-${user.name?.replace(/\s+/g, '-').toLowerCase()}-${formation.replace(/\s+/g, '-').toLowerCase()}.pdf`

  // Télécharger le PDF
  pdf.save(fileName)
}
