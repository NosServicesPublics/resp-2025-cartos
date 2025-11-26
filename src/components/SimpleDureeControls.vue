<script setup lang="ts">
import { computed } from 'vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()

// Get the current service controls
const metricControl = computed(() => {
  const controls = mapStore.formControls
  return controls.find(c => c.key === 'metric')
})

const facilityControl = computed(() => {
  const controls = mapStore.formControls
  return controls.find(c => c.key === 'facility')
})

// Filter to only show the requested metrics
const availableMetrics = computed(() => {
  const metricKeys = ['mediane', 'rapport_d9_d1', 'gini']
  return metricControl.value?.entries.filter(entry =>
    metricKeys.includes(entry.key),
  ) || []
})

// Filter to only show requested facilities
const availableFacilities = computed(() => {
  const facilityKeys = ['implantations_france_services_ifs', 'urgences', 'maternite', 'ecole_maternelle', 'institut_universitaire']
  return facilityControl.value?.entries.filter(entry =>
    facilityKeys.includes(entry.key),
  ) || []
})

// Get current selected values
const currentMetric = computed(() => mapStore.getSelectedEntry('metric'))
const currentFacility = computed(() => mapStore.getSelectedEntry('facility'))

// Metric descriptions
const metricDescriptions: Record<string, string> = {
  mediane: 'Durée d\'accès médiane : la moitié de la population accède au service en moins de temps, l\'autre moitié en plus de temps',
  rapport_d9_d1: 'Rapport d\'accès D1/D9 : rapport entre le temps d\'accès des 10% les plus éloignés (D9) et des 10% les plus proches (D1). Plus le rapport est élevé, plus les inégalités sont fortes',
  gini: 'Coefficient de Gini : mesure l\'inégalité de distribution des temps d\'accès (0 = égalité parfaite, 1 = inégalité maximale)',
}

function handleMetricChange(metricKey: string) {
  mapStore.setSelectedEntry('metric', metricKey)
}

function handleFacilityChange(facilityKey: string) {
  mapStore.setSelectedEntry('facility', facilityKey)
}
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6">
    <!-- Metric selector -->
    <div class="form-control">
      <label class="label">
        <span class="label-text text-sm font-semibold">Indicateur</span>
      </label>
      <div class="flex flex-col">
        <label
          v-for="metric in availableMetrics"
          :key="metric.key"
          class="label cursor-pointer justify-start gap-3 py-2"
        >
          <input
            type="radio"
            name="metric"
            class="radio radio-xs"
            :value="metric.key"
            :checked="currentMetric === metric.key"
            @change="handleMetricChange(metric.key)"
          >
          <span class="label-text text-sm">{{ metric.label }}</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle tooltip tooltip-right"
            :data-tip="metricDescriptions[metric.key]"
            @click.stop
          >
            <i class="ri-information-line text-sm" />
          </button>
        </label>
      </div>
    </div>

    <!-- Facility selector -->
    <div class="form-control">
      <label class="label">
        <span class="label-text text-sm font-semibold">Service ou équipement</span>
      </label>
      <div class="flex flex-col">
        <label
          v-for="facility in availableFacilities"
          :key="facility.key"
          class="label cursor-pointer justify-start gap-3 py-2"
        >
          <input
            type="radio"
            name="facility"
            class="radio radio-xs"
            :value="facility.key"
            :checked="currentFacility === facility.key"
            @change="handleFacilityChange(facility.key)"
          >
          <span class="label-text text-sm">{{ facility.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
