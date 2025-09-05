/**
 * IST (Indian Standard Time) utility functions
 * IST is UTC+5:30
 */

/**
 * Convert UTC date to IST
 */
export function utcToIst(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  // Add 5.5 hours to convert UTC to IST
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
}

/**
 * Convert IST date to UTC
 * This function takes a date that represents IST time and converts it to UTC
 */
export function istToUtc(istDate: Date | string): Date {
  const date = typeof istDate === 'string' ? new Date(istDate) : istDate
  
  // Since we're already in IST timezone, we need to convert to UTC
  // IST is UTC+5:30, so we subtract 5.5 hours to get UTC
  const utcDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000))
  
  return utcDate
}

/**
 * Format date in IST timezone
 */
export function formatIstDate(date: Date | string, format: string = 'PPp'): string {
  const istDate = utcToIst(date)
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...(format === 'PPp' ? {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    } : {})
  })
}

/**
 * Format time in IST timezone
 */
export function formatIstTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format date in IST timezone (short format)
 */
export function formatIstDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get current IST time
 */
export function getCurrentIstTime(): Date {
  return utcToIst(new Date())
}

/**
 * Create a date in IST timezone
 */
export function createIstDate(year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date {
  const istDate = new Date(year, month - 1, day, hour, minute, 0, 0)
  return istToUtc(istDate)
}