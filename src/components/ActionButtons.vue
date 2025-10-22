<script setup lang="ts">
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()
const showFeedback = ref(false)
const feedbackMessage = ref('')

/**
 * Sanitize a string for use in filename by normalizing accents and removing special characters
 */
function sanitizeForFilename(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036F]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

/**
 * Generate a descriptive filename based on current selections
 */
function generateFilename(extension: 'svg' | 'png'): string {
  const currentService = mapStore.currentService
  if (!currentService) {
    return `carte.${extension}`
  }

  const parts: string[] = []

  // Add service title
  const serviceTitle = sanitizeForFilename(currentService.title)
  parts.push(serviceTitle)

  // Add facility/service selection if available
  const facilityKey = mapStore.getSelectedEntry('facility')
  if (facilityKey) {
    const facilityLabel = currentService.getSelectedEntryLabel('facility')
    if (facilityLabel) {
      // Truncate and sanitize facility name (max 20 chars)
      const facility = sanitizeForFilename(facilityLabel).substring(0, 20).replace(/-+$/, '')
      parts.push(facility)
    }
  }

  // Add metric selection if available
  const metricKey = mapStore.getSelectedEntry('metric')
  if (metricKey) {
    const metricLabel = currentService.getSelectedEntryLabel('metric')
    if (metricLabel) {
      // Truncate and sanitize metric name (max 15 chars)
      const metric = sanitizeForFilename(metricLabel).substring(0, 15).replace(/-+$/, '')
      parts.push(metric)
    }
  }

  // Join parts and add extension
  return `${parts.join('_')}.${extension}`
}

async function shareMap() {
  try {
    const shareableUrl = mapStore.getShareableUrl()

    if (!shareableUrl) {
      feedbackMessage.value = 'Impossible de générer le lien de partage'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
      return
    }

    // Copy to clipboard
    await navigator.clipboard.writeText(shareableUrl)

    feedbackMessage.value = 'Lien copié dans le presse-papier !'
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 3000)
  }
  catch (error) {
    console.error('Failed to copy to clipboard:', error)
    feedbackMessage.value = 'Erreur lors de la copie du lien'
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 3000)
  }
}

async function downloadSvg() {
  try {
    // Find the complete figure element that contains title and both SVGs
    const figureElement = document.querySelector('.map-container figure')

    if (!figureElement) {
      feedbackMessage.value = 'Aucune carte à télécharger'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
      return
    }

    // Get all elements within the figure
    const titleElement = figureElement.querySelector('h2')
    const svgElements = figureElement.querySelectorAll('svg')

    if (svgElements.length === 0) {
      feedbackMessage.value = 'Aucune carte SVG trouvée'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
      return
    }

    // Generate filename based on current selections
    const filename = generateFilename('svg')

    // Create a combined SVG that includes title and both legend and map
    const combinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    combinedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Get the computed outline color from the figure element early
    // This is the darkest color from the active palette
    const computedColor = window.getComputedStyle(figureElement).color || '#222'

    // Calculate dimensions and layout
    let totalWidth = 0
    let totalHeight = 0
    let currentY = 0

    // Add title as text element if it exists
    if (titleElement && titleElement.textContent?.trim()) {
      const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      titleText.setAttribute('x', '0')
      titleText.setAttribute('y', '30')
      titleText.setAttribute('font-family', 'Arial, sans-serif')
      titleText.setAttribute('font-size', '24')
      titleText.setAttribute('font-weight', 'bold')
      titleText.setAttribute('fill', computedColor)
      titleText.textContent = titleElement.textContent.trim()
      combinedSvg.appendChild(titleText)
      currentY = 50
      totalWidth = Math.max(totalWidth, 400) // Minimum width for title
    }

    // Add each SVG as a group
    svgElements.forEach((svg) => {
      const svgClone = svg.cloneNode(true) as SVGElement

      // Remove tooltip elements from export
      // Observable Plot tooltips have aria-label="tip"
      const tooltips = svgClone.querySelectorAll('[aria-label="tip"]')
      tooltips.forEach((tooltip) => {
        tooltip.remove()
      })

      // Remove tooltip centroid dots from export
      // Observable Plot renders these as circles in a group
      const circles = svgClone.querySelectorAll('circle')
      circles.forEach((circle) => {
        circle.remove()
      })

      // Replace currentColor with actual color value in attributes
      const elementsWithCurrentColor = svgClone.querySelectorAll('[color="currentColor"], [fill="currentColor"], [stroke="currentColor"]')
      elementsWithCurrentColor.forEach((element) => {
        if (element.getAttribute('color') === 'currentColor') {
          element.setAttribute('color', computedColor)
        }
        if (element.getAttribute('fill') === 'currentColor') {
          element.setAttribute('fill', computedColor)
        }
        if (element.getAttribute('stroke') === 'currentColor') {
          element.setAttribute('stroke', computedColor)
        }
      })

      // Also replace currentColor in inline styles (for title text)
      const allElements = svgClone.querySelectorAll('*')
      allElements.forEach((element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          const style = element.getAttribute('style')
          if (style) {
            let updatedStyle = style

            // Replace currentColor with actual color
            if (style.includes('currentColor')) {
              updatedStyle = updatedStyle.replace(/currentColor/g, computedColor)
            }

            // Replace Poppins or any custom font with sans-serif
            if (style.includes('font-family')) {
              updatedStyle = updatedStyle.replace(/font-family:[^;]+/g, 'font-family: Arial, sans-serif')
            }

            if (updatedStyle !== style) {
              element.setAttribute('style', updatedStyle)
            }
          }
        }

        // For text elements without explicit fill, set it explicitly to use palette color
        if (element.tagName === 'text' || element.tagName === 'tspan') {
          const fill = element.getAttribute('fill')
          // If no fill attribute or it's currentColor, set it explicitly
          if (!fill || fill === 'currentColor') {
            element.setAttribute('fill', computedColor)
          }

          // Ensure all text uses sans-serif font for better compatibility
          const fontFamily = element.getAttribute('font-family')
          if (!fontFamily || fontFamily.includes('Poppins')) {
            element.setAttribute('font-family', 'Arial, sans-serif')
          }
        }
      })

      const svgWidth = Number.parseFloat(svgClone.getAttribute('width') || '0')
      const svgHeight = Number.parseFloat(svgClone.getAttribute('height') || '0')

      // Create a group to contain this SVG's content
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', `translate(0, ${currentY})`)

      // Copy all child elements from the SVG to the group
      while (svgClone.firstChild) {
        group.appendChild(svgClone.firstChild)
      }

      combinedSvg.appendChild(group)

      // Update dimensions
      totalWidth = Math.max(totalWidth, svgWidth)
      currentY += svgHeight + 20 // Add some spacing between elements
      totalHeight = currentY
    })

    // Set final dimensions
    combinedSvg.setAttribute('width', totalWidth.toString())
    combinedSvg.setAttribute('height', totalHeight.toString())
    combinedSvg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`)

    // Serialize the combined SVG
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(combinedSvg)

    // Add XML declaration
    const svgWithDeclaration = `<?xml version="1.0" encoding="UTF-8"?>
${svgString}`

    // Create and trigger download
    const blob = new Blob([svgWithDeclaration], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = filename
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up
    URL.revokeObjectURL(url)

    feedbackMessage.value = 'Carte téléchargée avec succès !'
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 3000)
  }
  catch (error) {
    console.error('Failed to download SVG:', error)
    feedbackMessage.value = 'Erreur lors du téléchargement'
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 3000)
  }
}

async function downloadPng() {
  try {
    // Find the complete figure element that contains title and both SVGs
    const figureElement = document.querySelector('.map-container figure')

    if (!figureElement) {
      feedbackMessage.value = 'Aucune carte à télécharger'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
      return
    }

    // Get all elements within the figure
    const titleElement = figureElement.querySelector('h2')
    const svgElements = figureElement.querySelectorAll('svg')

    if (svgElements.length === 0) {
      feedbackMessage.value = 'Aucune carte SVG trouvée'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
      return
    }

    // Generate filename based on current selections
    const filename = generateFilename('png')

    // Create a combined SVG (same logic as downloadSvg)
    const combinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    combinedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Get the computed outline color from the figure element early
    // This is the darkest color from the active palette
    const computedColor = window.getComputedStyle(figureElement).color || '#222'

    // Calculate dimensions and layout
    let totalWidth = 0
    let totalHeight = 0
    let currentY = 0

    // Add title as text element if it exists
    if (titleElement && titleElement.textContent?.trim()) {
      const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      titleText.setAttribute('x', '0')
      titleText.setAttribute('y', '30')
      titleText.setAttribute('font-family', 'Arial, sans-serif')
      titleText.setAttribute('font-size', '18')
      titleText.setAttribute('font-weight', 'bold')
      titleText.setAttribute('fill', computedColor)
      titleText.textContent = titleElement.textContent.trim()
      combinedSvg.appendChild(titleText)
      currentY = 50
      totalWidth = Math.max(totalWidth, 400) // Minimum width for title
    }

    // Add each SVG as a group
    svgElements.forEach((svg) => {
      const svgClone = svg.cloneNode(true) as SVGElement

      // Remove tooltip elements from export
      // Observable Plot tooltips have aria-label="tip"
      const tooltips = svgClone.querySelectorAll('[aria-label="tip"]')
      tooltips.forEach((tooltip) => {
        tooltip.remove()
      })

      // Remove tooltip centroid dots from export
      // These are circles with r="15" and fill="transparent"
      const centroidDots = svgClone.querySelectorAll('circle[r="15"][fill="transparent"]')
      centroidDots.forEach(dot => dot.remove())

      // Replace currentColor with actual color value in attributes
      const elementsWithCurrentColor = svgClone.querySelectorAll('[color="currentColor"], [fill="currentColor"], [stroke="currentColor"]')
      elementsWithCurrentColor.forEach((element) => {
        if (element.getAttribute('color') === 'currentColor') {
          element.setAttribute('color', computedColor)
        }
        if (element.getAttribute('fill') === 'currentColor') {
          element.setAttribute('fill', computedColor)
        }
        if (element.getAttribute('stroke') === 'currentColor') {
          element.setAttribute('stroke', computedColor)
        }
      })

      // Also replace currentColor in inline styles (for title text)
      const allElements = svgClone.querySelectorAll('*')
      allElements.forEach((element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          const style = element.getAttribute('style')
          if (style) {
            let updatedStyle = style

            // Replace currentColor with actual color
            if (style.includes('currentColor')) {
              updatedStyle = updatedStyle.replace(/currentColor/g, computedColor)
            }

            // Replace Poppins or any custom font with sans-serif
            if (style.includes('font-family')) {
              updatedStyle = updatedStyle.replace(/font-family:[^;]+/g, 'font-family: Arial, sans-serif')
            }

            if (updatedStyle !== style) {
              element.setAttribute('style', updatedStyle)
            }
          }
        }

        // For text elements without explicit fill, set it explicitly to use palette color
        if (element.tagName === 'text' || element.tagName === 'tspan') {
          const fill = element.getAttribute('fill')
          // If no fill attribute or it's currentColor, set it explicitly
          if (!fill || fill === 'currentColor') {
            element.setAttribute('fill', computedColor)
          }

          // Ensure all text uses sans-serif font for better compatibility
          const fontFamily = element.getAttribute('font-family')
          if (!fontFamily || fontFamily.includes('Poppins')) {
            element.setAttribute('font-family', 'Arial, sans-serif')
          }
        }
      })

      const svgWidth = Number.parseFloat(svgClone.getAttribute('width') || '0')
      const svgHeight = Number.parseFloat(svgClone.getAttribute('height') || '0')

      // Create a group to contain this SVG's content
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', `translate(0, ${currentY})`)

      // Copy all child elements from the SVG to the group
      while (svgClone.firstChild) {
        group.appendChild(svgClone.firstChild)
      }

      combinedSvg.appendChild(group)

      // Update dimensions
      totalWidth = Math.max(totalWidth, svgWidth)
      currentY += svgHeight + 20 // Add some spacing between elements
      totalHeight = currentY
    })

    // Set final dimensions
    combinedSvg.setAttribute('width', totalWidth.toString())
    combinedSvg.setAttribute('height', totalHeight.toString())
    combinedSvg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`)

    // Convert SVG to PNG using Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Set canvas dimensions with higher resolution for better quality
    const scale = 2 // Higher resolution
    canvas.width = totalWidth * scale
    canvas.height = totalHeight * scale

    // Scale the context for high DPI
    ctx.scale(scale, scale)

    // Set white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, totalWidth, totalHeight)

    // Create image from SVG
    const img = new Image()
    const svgBlob = new Blob([new XMLSerializer().serializeToString(combinedSvg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    // Wait for image to load and draw to canvas
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, totalWidth, totalHeight)
        URL.revokeObjectURL(url)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load SVG as image'))
      }
      img.src = url
    })

    // Convert canvas to PNG and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create PNG blob')
      }

      const pngUrl = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(pngUrl)

      feedbackMessage.value = 'Carte PNG téléchargée avec succès !'
      showFeedback.value = true
      setTimeout(() => {
        showFeedback.value = false
      }, 3000)
    }, 'image/png')
  }
  catch (error) {
    console.error('Failed to download PNG:', error)
    feedbackMessage.value = 'Erreur lors du téléchargement PNG'
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 3000)
  }
}
</script>

<template>
  <div class="relative w-full">
    <div class="flex flex-col gap-3">
      <button
        class="btn w-full btn-soft gap-2"
        :disabled="!mapStore.currentMapId"
        @click="shareMap"
      >
        <i class="ri-share-line text-base" />
        Partager la carte à l'écran
      </button>

      <button
        class="btn w-full btn-soft gap-2"
        :disabled="!mapStore.currentMapId"
        @click="downloadSvg"
      >
        <i class="ri-download-line text-base" />
        Télécharger en SVG
      </button>

      <button
        class="btn w-full btn-soft gap-2"
        :disabled="!mapStore.currentMapId"
        @click="downloadPng"
      >
        <i class="ri-image-line text-base" />
        Télécharger en PNG
      </button>
    </div>

    <!-- Success/Error feedback toast -->
    <div
      v-if="showFeedback"
      class="toast toast-top toast-end"
    >
      <div class="alert alert-success alert-soft shadow-lg">
        <i class="ri-check-line text-base" />
        <span>{{ feedbackMessage }}</span>
      </div>
    </div>
  </div>
</template>
