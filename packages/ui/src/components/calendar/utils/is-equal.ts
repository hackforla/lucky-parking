import { CalendarDate } from "./create-calendar"

export function isEqual({ day, month, year }: CalendarDate, targetDate: Date | null): boolean {
  if (!targetDate) return false
  return (
    targetDate.getDate() === day &&
    targetDate.getMonth() === month &&
    targetDate.getFullYear() === year
  )
}
