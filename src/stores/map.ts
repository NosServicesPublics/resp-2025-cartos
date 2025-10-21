import type { MapServiceEntry } from '@/services/map-registry'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loadDepartementsData } from '@/data/geodata-loader'
import { ErrorHandler, ServiceInitializationError } from '@/lib/errors'
import { mapRegistry } from '@/services/registry-setup'

export const useMapStore = defineStore('map', () => {
  // State
  const currentMapId = ref<string | null>(null)
  const geoData = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentMapEntry = computed<MapServiceEntry | null>(() => {
    return currentMapId.value ? mapRegistry.get(currentMapId.value) || null : null
  })

  const currentService = computed(() => {
    return currentMapEntry.value?.service || null
  })

  const currentRenderer = computed(() => {
    return currentMapEntry.value?.renderer || null
  })

  const formControls = computed(() => {
    if (!currentService.value)
      return []
    // Use filtered form controls to dynamically adjust based on current metric selection
    return currentService.value.getFilteredFormControls()
  })

  const availableMaps = computed(() => {
    return mapRegistry
      .getAll()
      .map(entry => ({
        id: entry.id,
        title: entry.service.title,
      }))
  })

  // Actions
  const setCurrentMap = async (mapId: string) => {
    if (currentMapId.value === mapId) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const mapEntry = mapRegistry.get(mapId)
      if (!mapEntry) {
        throw new ServiceInitializationError(mapId, undefined, { available: mapRegistry.getIds() })
      }

      // Load geo data if not already loaded
      if (!geoData.value) {
        geoData.value = await loadDepartementsData()
      }

      // Load map service data
      await mapEntry.service.loadData()

      // Update current map
      currentMapId.value = mapId
    }
    catch (err) {
      const atlasError = err instanceof Error ? err : new Error('Unknown error occurred')
      error.value = ErrorHandler.getUserMessage(atlasError)
      ErrorHandler.logError(atlasError instanceof Error
        ? new ServiceInitializationError(mapId, atlasError)
        : new ServiceInitializationError(mapId),
      )
    }
    finally {
      isLoading.value = false
    }
  }

  const setSelectedEntry = (entryKey: string, selectedKey: string) => {
    if (!currentService.value) {
      return
    }
    currentService.value.setSelectedEntry(entryKey, selectedKey)
  }

  const getSelectedEntry = (entryKey: string) => {
    if (!currentService.value)
      return ''
    return currentService.value.getSelectedEntry(entryKey) || ''
  }

  const initialize = async () => {
    const availableMapIds = mapRegistry.getIds()
    if (availableMapIds.length > 0 && availableMapIds[0]) {
      await setCurrentMap(availableMapIds[0])
    }
  }

  const initializeFromUrlParams = async (urlParams: URLSearchParams) => {
    const mapId = urlParams.get('map')
    const availableMapIds = mapRegistry.getIds()

    // Use map from URL if valid, otherwise use first available
    const targetMapId = mapId && availableMapIds.includes(mapId) ? mapId : availableMapIds[0]

    if (targetMapId) {
      await setCurrentMap(targetMapId)

      // Restore form control selections after service is loaded
      if (currentService.value) {
        for (const control of currentService.value.formControls) {
          const selectedValue = urlParams.get(`control_${control.key}`)
          if (selectedValue && control.entries.some(entry => entry.key === selectedValue)) {
            setSelectedEntry(control.key, selectedValue)
          }
        }
      }
    }
  }

  const getShareableUrl = () => {
    if (!currentMapId.value || !currentService.value) {
      return ''
    }

    const url = new URL(window.location.href)
    url.searchParams.set('map', currentMapId.value)

    // Add form control selections
    for (const control of currentService.value.formControls) {
      const selectedValue = getSelectedEntry(control.key)
      if (selectedValue) {
        url.searchParams.set(`control_${control.key}`, selectedValue)
      }
    }

    return url.toString()
  }

  return {
    geoData,
    // State
    currentMapId,
    isLoading,
    error,

    // Getters
    currentService,
    currentRenderer,
    formControls,
    availableMaps,

    // Actions
    setCurrentMap,
    setSelectedEntry,
    getSelectedEntry,
    initialize,
    initializeFromUrlParams,
    getShareableUrl,
  }
})
