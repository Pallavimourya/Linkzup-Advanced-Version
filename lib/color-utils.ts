/**
 * Utility functions for handling modern CSS colors and converting them to formats
 * compatible with html2canvas and other canvas-based libraries
 */

/**
 * Converts modern CSS color functions (oklch, lch, hsl, etc.) to hex format
 * @param color - The CSS color value to convert
 * @returns Hex color string
 */
export function convertColorToHex(color: string): string {
  if (!color) return '#ffffff'
  
  // If it's already a hex color, return as is
  if (color.startsWith('#')) return color
  
  // If it's a CSS custom property, try to resolve it
  if (color.startsWith('var(')) {
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.color = color
      tempDiv.style.position = 'absolute'
      tempDiv.style.visibility = 'hidden'
      document.body.appendChild(tempDiv)
      
      const computedColor = window.getComputedStyle(tempDiv).color
      document.body.removeChild(tempDiv)
      
      return rgbToHex(computedColor)
    } catch (error) {
      console.warn('CSS custom property conversion failed:', error)
      return '#ffffff'
    }
  }
  
  // If it's an oklch, lch, hsl, or other modern color function
  if (color.includes('oklch') || color.includes('lch') || color.includes('hsl') || color.includes('rgb')) {
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.color = color
      tempDiv.style.position = 'absolute'
      tempDiv.style.visibility = 'hidden'
      document.body.appendChild(tempDiv)
      
      const computedColor = window.getComputedStyle(tempDiv).color
      document.body.removeChild(tempDiv)
      
      return rgbToHex(computedColor)
    } catch (error) {
      console.warn('Color conversion failed:', error)
      return '#ffffff'
    }
  }
  
  return color
}

/**
 * Converts RGB color string to hex format
 * @param rgb - RGB color string (e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
 * @returns Hex color string
 */
function rgbToHex(rgb: string): string {
  if (!rgb.startsWith('rgb')) return '#ffffff'
  
  const values = rgb.match(/\d+/g)
  if (values && values.length >= 3) {
    const r = parseInt(values[0])
    const g = parseInt(values[1])
    const b = parseInt(values[2])
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
  
  return '#ffffff'
}

/**
 * Gets the computed background color of an element, handling modern CSS colors
 * @param element - The DOM element to get the background color from
 * @returns Hex color string
 */
export function getComputedBackgroundColor(element: HTMLElement): string {
  try {
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return rgbToHex(backgroundColor)
    }
    
    // If no background color, check for background image
    const backgroundImage = computedStyle.backgroundImage
    if (backgroundImage && backgroundImage !== 'none') {
      return '#ffffff' // Use white background for images
    }
    
    return '#ffffff' // Default fallback
  } catch (error) {
    console.warn('Failed to get computed background color:', error)
    return '#ffffff'
  }
}

/**
 * Enhanced html2canvas options that handle modern CSS colors
 * @param backgroundColor - The background color to use
 * @returns html2canvas options object
 */
export function getHtml2CanvasOptions(backgroundColor: string = '#ffffff') {
  return {
    backgroundColor: convertColorToHex(backgroundColor),
    scale: 2,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: false,
    logging: false,
    // Additional options to handle modern CSS
    ignoreElements: (element: Element) => {
      // Skip elements that might cause issues
      return element.classList?.contains('ignore-canvas') || false
    },
    onclone: (clonedDoc: Document) => {
      // Process the cloned document to handle modern CSS colors
      const elements = clonedDoc.querySelectorAll('*')
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement
        if (htmlElement.style) {
          // Convert any modern color functions in inline styles
          const style = htmlElement.style
          if (style.color) {
            style.color = convertColorToHex(style.color)
          }
          if (style.backgroundColor) {
            style.backgroundColor = convertColorToHex(style.backgroundColor)
          }
          if (style.borderColor) {
            style.borderColor = convertColorToHex(style.borderColor)
          }
        }
      })
    }
  }
}
