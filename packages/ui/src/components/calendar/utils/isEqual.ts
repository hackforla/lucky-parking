import { CalendarDate } from "./createCalender"

export function isEqual({ day, month, year }: CalendarDate, targetDate: Date): boolean {
  if (!targetDate) return false
  return (
    targetDate.getDate() === day &&
    targetDate.getMonth() === month &&
    targetDate.getFullYear() === year
  )
}
