"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
export interface Exam {
  id: number
  moduleName: string
  formation: string
  department: string
  date: string
  startTime: string
  endTime: string
  duration: number
  roomId: number
  room: string
  professorId: number
  professor: string
  studentCount: number
  type: string
  status: 'planned' | 'confirmed' | 'cancelled'
}
export type ScheduleApprovalStatus = 'pending_chef' | 'approved_chef' | 'pending_doyen' | 'approved_doyen' | 'published' | 'rejected'
export interface ScheduleMetadata {
  id: string
  status: ScheduleApprovalStatus
  generatedAt: string
  generatedBy: string
  approvedByChef?: string
  approvedByChefAt?: string
  approvedByDoyen?: string
  approvedByDoyenAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}
interface ScheduleContextType {
  exams: Exam[]
  scheduleMetadata: ScheduleMetadata | null
  addExam: (exam: Exam) => void
  updateExam: (examId: number, updates: Partial<Exam>) => void
  deleteExam: (examId: number) => void
  confirmExam: (examId: number) => void
  clearSchedule: () => void
  generateSchedule: (department?: string) => void
  getStudentExams: (formation: string, department: string) => Exam[]
  getTeacherExams: (professorId: number) => Exam[]
  approveByChef: (approvedBy: string) => void
  rejectByChef: (rejectedBy: string, reason?: string) => void
  approveByDoyen: (approvedBy: string) => void
  rejectByDoyen: (rejectedBy: string, reason?: string) => void
  publishSchedule: () => void
}
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)
export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([])
  const [scheduleMetadata, setScheduleMetadata] = useState<ScheduleMetadata | null>(null)
  useEffect(() => {
    const savedExams = localStorage.getItem('generated-schedule')
    const savedMetadata = localStorage.getItem('schedule-metadata')
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams))
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error)
      }
    }
    if (savedMetadata) {
      try {
        setScheduleMetadata(JSON.parse(savedMetadata))
      } catch (error) {
        console.error('Erreur lors du chargement des métadonnées:', error)
      }
    }
  }, [])
  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem('generated-schedule', JSON.stringify(exams))
    }
  }, [exams])
  useEffect(() => {
    if (scheduleMetadata) {
      localStorage.setItem('schedule-metadata', JSON.stringify(scheduleMetadata))
    }
  }, [scheduleMetadata])
  const addExam = (exam: Exam) => {
    setExams((prev: Exam[]) => [...prev, exam])
  }
  const updateExam = (examId: number, updates: Partial<Exam>) => {
    setExams((prev: Exam[]) => prev.map((exam: Exam) =>
      exam.id === examId ? { ...exam, ...updates } : exam
    ))
  }
  const deleteExam = (examId: number) => {
    setExams((prev: Exam[]) => prev.filter((exam: Exam) => exam.id !== examId))
  }
  const confirmExam = (examId: number) => {
    updateExam(examId, { status: 'confirmed' })
  }
  const clearSchedule = () => {
    setExams([])
    localStorage.removeItem('generated-schedule')
  }
  const generateSchedule = (department?: string) => {
    const formations = [
      "Licence 1 Informatique",
      "Licence 2 Informatique",
      "Licence 3 Informatique",
      "Master 1 Développement Web",
      "Master 1 Intelligence Artificielle",
      "Master 2 Sécurité Informatique"
    ]
    const rooms = [
      { id: 1, name: "Amphi A", capacity: 500 },
      { id: 2, name: "Amphi B", capacity: 400 },
      { id: 3, name: "Amphi C", capacity: 350 },
      { id: 4, name: "Salle TP-101", capacity: 20 },
      { id: 5, name: "Salle TD-202", capacity: 20 }
    ]
    const professors = [
      { id: 1, name: "Dr. Ahmed Martin" },
      { id: 2, name: "Pr. Fatima Dubois" },
      { id: 3, name: "Dr. Youssef Bennani" },
      { id: 4, name: "Pr. Amina Tazi" },
      { id: 5, name: "Dr. Karim Alaoui" }
    ]
    const modules = [
      "Algorithmique Avancée",
      "Bases de Données",
      "Programmation Orientée Objet",
      "Réseaux Informatiques",
      "Intelligence Artificielle",
      "Structures de Données",
      "Mathématiques Discrètes",
      "Systèmes d'Exploitation"
    ]
    const generatedExams: Exam[] = []
    formations.forEach((formation, formationIndex) => {
      const dept = department || (formationIndex < 3 ? "Informatique" : "Mathématiques")
      const formationModules = modules.slice(0, Math.floor(Math.random() * 4) + 4)
      formationModules.forEach((moduleName, moduleIndex) => {
        const examDate = new Date()
        examDate.setDate(examDate.getDate() + Math.floor(Math.random() * 14) + 1)
        const startHour = 9 + Math.floor(Math.random() * 8)
        const duration = [120, 180, 90, 150][Math.floor(Math.random() * 4)]
        const suitableRooms = rooms.filter(room => room.capacity >= 15 + Math.floor(Math.random() * 100))
        const selectedRoom = suitableRooms[Math.floor(Math.random() * suitableRooms.length)]
        const selectedProfessor = professors[Math.floor(Math.random() * professors.length)]
        const exam: Exam = {
          id: formationIndex * 100 + moduleIndex + 1,
          moduleName,
          formation,
          department: dept,
          date: examDate.toISOString().split('T')[0],
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${(startHour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`,
          duration,
          roomId: selectedRoom.id,
          room: selectedRoom.name,
          professorId: selectedProfessor.id,
          professor: selectedProfessor.name,
          studentCount: Math.floor(Math.random() * 80) + 20,
          type: ["Écrit", "Oral", "TP", "Projet"][Math.floor(Math.random() * 4)],
          status: 'planned'
        }
        generatedExams.push(exam)
      })
    })
    setExams(generatedExams)
    const metadata: ScheduleMetadata = {
      id: `schedule-${Date.now()}`,
      status: 'pending_chef',
      generatedAt: new Date().toISOString(),
      generatedBy: 'admin'
    }
    setScheduleMetadata(metadata)
  }
  const getStudentExams = (formation: string, department: string) => {
    return exams.filter((exam: Exam) =>
      exam.formation === formation &&
      exam.department === department &&
      scheduleMetadata?.status === 'published'
    )
  }
  const getTeacherExams = (professorId: number) => {
    return exams.filter((exam: Exam) =>
      exam.professorId === professorId &&
      scheduleMetadata?.status === 'published'
    )
  }
  const approveByChef = (approvedBy: string) => {
    if (scheduleMetadata) {
      setScheduleMetadata({
        ...scheduleMetadata,
        status: 'approved_chef',
        approvedByChef: approvedBy,
        approvedByChefAt: new Date().toISOString()
      })
    }
  }
  const rejectByChef = (rejectedBy: string, reason?: string) => {
    if (scheduleMetadata) {
      setScheduleMetadata({
        ...scheduleMetadata,
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      })
    }
  }
  const approveByDoyen = (approvedBy: string) => {
    if (scheduleMetadata) {
      setScheduleMetadata({
        ...scheduleMetadata,
        status: 'approved_doyen',
        approvedByDoyen: approvedBy,
        approvedByDoyenAt: new Date().toISOString()
      })
    }
  }
  const rejectByDoyen = (rejectedBy: string, reason?: string) => {
    if (scheduleMetadata) {
      setScheduleMetadata({
        ...scheduleMetadata,
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      })
    }
  }
  const publishSchedule = () => {
    if (scheduleMetadata) {
      setScheduleMetadata({
        ...scheduleMetadata,
        status: 'published'
      })
    }
  }
  return (
    <ScheduleContext.Provider value={{
      exams,
      scheduleMetadata,
      addExam,
      updateExam,
      deleteExam,
      confirmExam,
      clearSchedule,
      generateSchedule,
      getStudentExams,
      getTeacherExams,
      approveByChef,
      rejectByChef,
      approveByDoyen,
      rejectByDoyen,
      publishSchedule
    }}>
      {children}
    </ScheduleContext.Provider>
  )
}
export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }
  return context
}
