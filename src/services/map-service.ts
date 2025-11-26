import type { ServiceConfig } from '@/services/service-config'
import type { FormControl, MapServiceOptions, ServiceDataRow } from '@/types/service.types'
import { ref } from 'vue'
import { loadCachedCSVData } from '@/data/data-cache'

export default class MapService {
  title: string
  dataFile: string
  delimiter: string
  data: ServiceDataRow[] = []
  formControls: FormControl[]
  selectedFormControls: Map<string, string> = new Map() // key: entry key, value: selected entry key
  version = ref(0) // Reactive trigger for UI updates
  dataPreprocessor?: (rows: ServiceDataRow[]) => ServiceDataRow[]
  serviceConfig?: ServiceConfig // Optional reference to full config for dynamic filtering

  constructor({
    title,
    dataFile,
    delimiter = ',',
    formControls,
    dataPreprocessor,
  }: MapServiceOptions) {
    this.title = title
    this.dataFile = dataFile
    this.delimiter = delimiter
    this.formControls = formControls
    this.dataPreprocessor = dataPreprocessor
    for (const control of this.formControls) {
      if (control.entries?.[0] != null) {
        this.selectedFormControls.set(control.key, control.entries[0].key)
      }
    }
  }

  async loadData(): Promise<void> {
    let data = await loadCachedCSVData(this.dataFile, false, this.delimiter)

    // Apply data preprocessor if provided
    if (this.dataPreprocessor) {
      data = this.dataPreprocessor(data)
    }

    this.data = data
  }

  getSelectedEntry(entryKey: string): string | undefined {
    // Access version to trigger reactivity when selections change
    const _triggerReactivity = this.version.value
    void _triggerReactivity
    return this.selectedFormControls.get(entryKey)
  }

  setSelectedEntry(entryKey: string, selectedKey: string) {
    this.selectedFormControls.set(entryKey, selectedKey)

    // If metric changed, validate that the current color scheme is compatible with the new metric type
    if (entryKey === 'metric' && this.serviceConfig) {
      // For configs where colorSchemes are keyed by facility, use the facility key instead
      const facilityKey = this.getSelectedEntry('facility')
      const schemeKey = facilityKey || selectedKey
      const metricConfig = this.serviceConfig.rendering.colorSchemes[schemeKey]
      const currentColorScheme = this.getSelectedEntry('colorScheme')

      if (currentColorScheme && currentColorScheme !== 'auto' && metricConfig) {
        const isDivergingMetric = metricConfig.type === 'diverging'
        const isDivergingScheme = currentColorScheme.includes('-')

        // Reset to 'auto' if scheme type doesn't match metric type
        if (isDivergingMetric !== isDivergingScheme) {
          this.selectedFormControls.set('colorScheme', 'auto')
        }
      }
    }

    // Safety check: ensure version is still a ref
    if (typeof this.version === 'object' && this.version !== null && 'value' in this.version) {
      this.version.value++
    }
    else {
      // Re-initialize if corrupted
      this.version = ref(0)
    }
  }

  getSelectedEntryLabel(entryKey: string): string | undefined {
    const selectedKey = this.getSelectedEntry(entryKey)
    if (!selectedKey) {
      return undefined
    }
    const formControl = this.formControls.find(control => control.key === entryKey)
    return formControl?.entries.find(entry => entry.key === selectedKey)?.label
  }

  get filteredData(): ServiceDataRow[] {
    const selectedFacility = this.selectedFormControls.get('facility')
    if (!selectedFacility) {
      return this.data
    }

    return this.data.filter((d) => {
      // For couverture data: filter by "Libelle" column
      if (d.Libelle !== undefined) {
        return d.Libelle === selectedFacility
      }
      // For duree data: filter by "Source" column
      if (d.Source !== undefined) {
        return d.Source === selectedFacility
      }
      // For inegalites data: filter by "facility" column
      if (d.facility !== undefined) {
        return d.facility === selectedFacility
      }
      // For inegalites-v2 data: filter by "Libelle_TYPEQU" column
      if (d.Libelle_TYPEQU !== undefined) {
        return d.Libelle_TYPEQU === selectedFacility
      }
      return true
    })
  }

  /**
   * Get form controls with dynamic filtering based on current selections
   * Filters out colorScheme control as colors are now determined by thematic category
   */
  getFilteredFormControls(): FormControl[] {
    return this.formControls.filter(control => control.key !== 'colorScheme')
  }
}
