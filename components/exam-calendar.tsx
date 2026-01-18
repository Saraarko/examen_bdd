"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, MapPin, User, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExamEvent {
    date: string
    isoDate?: string
    time: string
    subject: string
    room: string
    professor: string
    type: string
    duration: number
    rawDate?: Date
}

interface ExamCalendarProps {
    exams: ExamEvent[]
    onExamClick?: (exam: ExamEvent) => void
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const MONTHS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

const EXAM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    "Écrit": { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-400" },
    "Oral": { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400" },
    "TP": { bg: "bg-purple-500/20", border: "border-purple-500", text: "text-purple-400" },
    "Projet": { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400" },
    "default": { bg: "bg-rose-500/20", border: "border-rose-500", text: "text-rose-400" },
}

function getExamColor(type: string) {
    return EXAM_COLORS[type] || EXAM_COLORS["default"]
}

export function ExamCalendar({ exams, onExamClick }: ExamCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [hoveredExam, setHoveredExam] = useState<ExamEvent | null>(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (exams.length > 0) {
            const firstExam = [...exams].sort((a, b) => {
                const dateA = a.isoDate ? new Date(a.isoDate) : new Date()
                const dateB = b.isoDate ? new Date(b.isoDate) : new Date()
                return dateA.getTime() - dateB.getTime()
            })[0]

            if (firstExam.isoDate) {
                const examDate = new Date(firstExam.isoDate)
                setCurrentDate(new Date(examDate.getFullYear(), examDate.getMonth(), 1))
            }
        }
    }, [exams])

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const examsByDate = useMemo(() => {
        const map = new Map<string, ExamEvent[]>()
        exams.forEach(exam => {
            let dateKey = ""
            if (exam.isoDate) {
                dateKey = exam.isoDate.split('T')[0]
            } else {
                const parts = exam.date.split(" ")
                if (parts.length >= 3) {
                    const day = parseInt(parts[0])
                    const monthName = parts[1].toLowerCase()
                    const year = parseInt(parts[2])
                    const monthIndex = MONTHS_FR.findIndex(m => m.toLowerCase() === monthName)
                    if (monthIndex !== -1) {
                        dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    }
                }
            }

            if (dateKey) {
                const existing = map.get(dateKey) || []
                map.set(dateKey, [...existing, exam])
            }
        })
        return map
    }, [exams])

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

        let startDay = firstDayOfMonth.getDay() - 1
        if (startDay < 0) startDay = 6

        const daysInMonth = lastDayOfMonth.getDate()
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

        const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean }> = []

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
                isCurrentMonth: false,
                isToday: false,
            })
        }

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i)
            days.push({
                date,
                isCurrentMonth: true,
                isToday: date.toISOString().split('T')[0] === todayStr,
            })
        }

        const remainingDays = 42 - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(currentYear, currentMonth + 1, i),
                isCurrentMonth: false,
                isToday: false,
            })
        }

        return days
    }, [currentYear, currentMonth])

    const handleExamHover = (exam: ExamEvent, event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setHoverPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 8 })
        setHoveredExam(exam)
    }

    return (
        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden min-h-[600px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">
                        {MONTHS_FR[currentMonth]} {currentYear}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="text-xs bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-slate-200"
                    >
                        Aujourd'hui
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="h-9 w-9 rounded-full hover:bg-slate-700/50 text-slate-300"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="h-9 w-9 rounded-full hover:bg-slate-700/50 text-slate-300"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-700/30 bg-slate-800/20">
                {Object.entries(EXAM_COLORS).filter(([key]) => key !== "default").map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", colors.bg, "border", colors.border)} />
                        <span className="text-xs text-slate-400">{type}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 border-b border-slate-700/30">
                {DAYS_FR.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-sm font-medium text-slate-400 bg-slate-800/20"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                    const dateKey = day.date.toISOString().split('T')[0]
                    const dayExams = examsByDate.get(dateKey) || []

                    return (
                        <div
                            key={index}
                            className={cn(
                                "min-h-[120px] p-2 border-b border-r border-slate-700/30 transition-colors",
                                !day.isCurrentMonth && "bg-slate-900/30",
                                day.isCurrentMonth && "bg-slate-800/10 hover:bg-slate-700/20",
                                day.isToday && "bg-blue-500/10 ring-1 ring-inset ring-blue-500/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full",
                                        day.isToday && "bg-blue-500 text-white font-semibold",
                                        !day.isToday && day.isCurrentMonth && "text-slate-200",
                                        !day.isCurrentMonth && "text-slate-500"
                                    )}
                                >
                                    {day.date.getDate()}
                                </span>
                                {dayExams.length > 0 && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        {dayExams.length} exam{dayExams.length > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayExams.slice(0, 3).map((exam, examIndex) => {
                                    const colors = getExamColor(exam.type)
                                    return (
                                        <div
                                            key={examIndex}
                                            className={cn(
                                                "px-2 py-1 rounded-md text-[11px] cursor-pointer transition-all duration-200",
                                                "border-l-2 hover:scale-[1.02] hover:shadow-lg truncate",
                                                colors.bg,
                                                colors.border,
                                                colors.text
                                            )}
                                            onMouseEnter={(e) => handleExamHover(exam, e)}
                                            onMouseLeave={() => setHoveredExam(null)}
                                        >
                                            <div className="font-semibold">{exam.time.split(" - ")[0]}</div>
                                            <div className="truncate">{exam.subject}</div>
                                        </div>
                                    )
                                })}
                                {dayExams.length > 3 && (
                                    <div className="text-[10px] text-slate-400 px-2 font-medium">
                                        +{dayExams.length - 3} autres
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {hoveredExam && (
                <div
                    className="fixed z-50 w-72 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                        left: Math.min(hoverPosition.x - 144, window.innerWidth - 300),
                        top: hoverPosition.y,
                    }}
                >
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-white text-lg leading-tight">{hoveredExam.subject}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium",
                                    getExamColor(hoveredExam.type).bg,
                                    getExamColor(hoveredExam.type).text
                                )}>
                                    {hoveredExam.type}
                                </span>
                                <span className="text-xs text-slate-400">{hoveredExam.duration} min</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span>{hoveredExam.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span>{hoveredExam.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <User className="h-4 w-4 text-slate-500" />
                                <span>{hoveredExam.professor}</span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                            {hoveredExam.date}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}