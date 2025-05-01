import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper function to get the next Saturday (or today if Saturday)
export const getNextSaturday = (): string => {
  const today = new Date()
  const nextSaturday = new Date(today)
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7))
  // Format as YYYY-MM-DD
  const year = nextSaturday.getFullYear()
  const month = (nextSaturday.getMonth() + 1).toString().padStart(2, '0')
  const day = nextSaturday.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}