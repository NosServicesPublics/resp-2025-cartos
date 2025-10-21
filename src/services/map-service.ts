import type { ServiceConfig } from '@/services/service-config'
import type { FormControl, MapServiceOptions, ServiceDataRow } from '@/types/service.types'
import { ref } from 'vue'
import { loadCachedCSVData } from '@/data/data-cache'

export default class MapService {
  title: string
  dataFile: string
  data: ServiceDataRow[] = []
  formControls: FormControl[]
  selectedFormControls: Map<string, string> = new Map() // key: entry key, value: selected entry key
  version = ref(0) // Reactive trigger for UI updates
  dataPreprocessor?: (rows: ServiceDataRow[]) => ServiceDataRow[]
  serviceConfig?: ServiceConfig // Optional reference to full config for dynamic filtering

  constructor({
    title,
    dataFile,
    formControls,
    dataPreprocessor,
  }: MapServiceOptions) {
    this.title = title
    this.dataFile = dataFile
    this.formControls = formControls
    this.dataPreprocessor = dataPreprocessor
    for (const control of this.formControls) {
      if (control.entries?.[0] != null) {
        this.selectedFormControls.set(control.key, control.entries[0].key)
      }
    }
  }

  async loadData(): Promise<void> {
    let data = await loadCachedCSVData(this.dataFile)

    // Apply data preprocessor if provided
    if (this.dataPreprocessor) {
      data = this.dataPreprocessor(data)
    }

    this.data = data
  }

  getSelectedEntry(entryKey: string): string | undefined {
    return this.selectedFormControls.get(entryKey)
  }

  setSelectedEntry(entryKey: string, selectedKey: string) {
    this.selectedFormControls.set(entryKey, selectedKey)

    // If metric changed and new metric uses diverging scale, reset colorScheme to 'auto'
    if (entryKey === 'metric' && this.serviceConfig) {
      const metricConfig = this.serviceConfig.rendering.colorSchemes[selectedKey]
      if (metricConfig?.type === 'diverging') {
        const currentColorScheme = this.getSelectedEntry('colorScheme')
        if (currentColorScheme && currentColorScheme !== 'auto') {
          this.selectedFormControls.set('colorScheme', 'auto')
        }
      }
    }

    this.version.value++
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
      return true
    })
  }

  /**
   * Get form controls with dynamic filtering based on current selections
   * Filters color scheme options when metric uses diverging scale
   */
  getFilteredFormControls(): FormControl[] {
    if (!this.serviceConfig) {
      return this.formControls
    }

    const selectedMetricKey = this.getSelectedEntry('metric')
    if (!selectedMetricKey) {
      return this.formControls
    }

    const metricConfig = this.serviceConfig.rendering.colorSchemes[selectedMetricKey]
    if (!metricConfig || metricConfig.type !== 'diverging') {
      return this.formControls
    }

    // Metric uses diverging scale - filter color scheme options
    return this.formControls.map((control) => {
      if (control.key !== 'colorScheme') {
        return control
      }

      // Only keep 'auto' option for diverging scales
      return {
        ...control,
        entries: control.entries.filter(entry => entry.key === 'auto'),
      }
    })
  }
}
