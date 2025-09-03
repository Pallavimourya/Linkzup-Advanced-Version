/**
 * IST (Indian Standard Time) utility functions
 * IST is UTC+5:30
 */

const IST_OFFSET = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30

/**
 * Convert UTC date to IST
 */
export function toIST(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET)
}

/**
 * Convert IST date to UTC
 */
export function fromIST(date: Date): Date {
  return new Date(date.getTime() - IST_OFFSET)
}

/**
 * Get current IST time
 */
export function getCurrentIST(): Date {
  return toIST(new Date())
}

/**
 * Format date in IST timezone
 */
export function formatIST(date: Date, formatString: string = "PPP"): string {
  const { format } = require("date-fns")
  return format(toIST(date), formatString)
}

/**
 * Format time in IST timezone
 */
export function formatISTTime(date: Date, formatString: string = "p"): string {
  const { format } = require("date-fns")
  return format(toIST(date), formatString)
}

/**
 * Format date and time in IST timezone
 */
export function formatISTDateTime(date: Date): string {
  const { format } = require("date-fns")
  return format(toIST(date), "MMM dd, yyyy 'at' h:mm a")
}

/**
 * Check if a date is in the future (considering IST)
 */
export function isFutureIST(date: Date): boolean {
  return fromIST(date) > new Date()
}

/**
 * Get IST timezone string for cron jobs
 */
export function getISTTimezone(): string {
  return "Asia/Kolkata"
}

/**
 * Convert IST time to UTC for cron job scheduling
 */
export function convertISTToUTCForCron(istDate: Date): Date {
  return fromIST(istDate)
}

/**
 * Get IST offset in hours
 */
export function getISTOffsetHours(): number {
  return 5.5
}
