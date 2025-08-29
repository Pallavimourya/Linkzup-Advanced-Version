// Browser compatibility utilities for Razorpay

export interface BrowserInfo {
  name: string
  version: string
  isSupported: boolean
  isMobile: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isEdge: boolean
}

export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'Unknown',
      version: 'Unknown',
      isSupported: false,
      isMobile: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
    }
  }

  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  let name = 'Unknown'
  let version = 'Unknown'
  let isSafari = false
  let isChrome = false
  let isFirefox = false
  let isEdge = false

  // Detect browser
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    isSafari = true
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Chrome')) {
    name = 'Chrome'
    isChrome = true
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    isFirefox = true
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Edg')) {
    name = 'Edge'
    isEdge = true
    const match = userAgent.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }

  // Check if browser is supported for Razorpay
  const isSupported = checkRazorpaySupport(name, version, isMobile)

  return {
    name,
    version,
    isSupported,
    isMobile,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
  }
}

function checkRazorpaySupport(browserName: string, version: string, isMobile: boolean): boolean {
  const versionNum = parseInt(version) || 0

  // Razorpay supports most modern browsers
  // These are general guidelines based on Razorpay documentation
  switch (browserName) {
    case 'Chrome':
      return versionNum >= 60
    case 'Firefox':
      return versionNum >= 60
    case 'Safari':
      return versionNum >= 12
    case 'Edge':
      return versionNum >= 79
    default:
      return false
  }
}

export function showBrowserCompatibilityError(): void {
  const browserInfo = getBrowserInfo()
  
  if (!browserInfo.isSupported) {
    const message = `
      This browser (${browserInfo.name} ${browserInfo.version}) is not supported for payments.
      Please try using:
      • Google Chrome (version 60 or higher)
      • Mozilla Firefox (version 60 or higher)
      • Safari (version 12 or higher)
      • Microsoft Edge (version 79 or higher)
    `
    
    alert(message)
  }
}

export function isRazorpaySupported(): boolean {
  const browserInfo = getBrowserInfo()
  return browserInfo.isSupported
}
