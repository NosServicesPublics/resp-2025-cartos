<script setup lang="ts">
import type { ThematicCategory } from '@/types/service.types'
import { computed, ref } from 'vue'
import SelectInput from '@/components/SelectInput.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useMapStore } from '@/stores/map'
import { THEMATIC_LABELS } from '@/types/service.types'

const mapStore = useMapStore()
const { isMobile } = useBreakpoints()

const selectedCategory = ref<ThematicCategory | null>(null)

const modeOptions = [
  { label: 'Navigation par thématique', key: 'thematic' },
  { label: 'Navigation par jeu de données', key: 'dataset' },
]

const categoryOptions = computed(() => {
  return mapStore.availableCategories.map(category => ({
    label: THEMATIC_LABELS[category],
    key: category,
  }))
})

const thematicMapOptions = computed(() => {
  if (!selectedCategory.value)
    return []
  return mapStore.getMapsByCategory(selectedCategory.value).map(map => ({
    label: map.title,
    key: map.id,
  }))
})

const datasetMapOptions = computed(() => {
  return mapStore.getDatasetMaps().map(map => ({
    label: map.title,
    key: map.id,
  }))
})

function handleModeChange(mode: string | undefined) {
  if (mode === 'thematic' || mode === 'dataset') {
    mapStore.setNavigationMode(mode)
    // Reset selection
    selectedCategory.value = null
    // In dataset mode, auto-select first dataset if available
    if (mode === 'dataset' && datasetMapOptions.value.length > 0) {
      const firstDataset = datasetMapOptions.value[0]
      if (firstDataset) {
        mapStore.setCurrentMap(firstDataset.key)
      }
    }
  }
}

function handleCategoryChange(category: string | undefined) {
  if (!category)
    return
  selectedCategory.value = category as ThematicCategory
  // Auto-select first map in category
  const maps = mapStore.getMapsByCategory(category as ThematicCategory)
  if (maps.length > 0 && maps[0]) {
    mapStore.setCurrentMap(maps[0].id)
  }
}

function handleMapChange(mapId: string | undefined) {
  if (mapId) {
    mapStore.setCurrentMap(mapId)
  }
}

// Initialize with first category
if (mapStore.availableCategories.length > 0 && !selectedCategory.value) {
  selectedCategory.value = mapStore.availableCategories[0] || null
}
</script>

<template>
  <div
    class="bg-base-100"
    :class="{
      'collapse collapse-arrow border border-base-300': isMobile,
    }"
  >
    <input
      v-if="isMobile"
      type="checkbox"
      name="accordion-navigation-picker"
      checked
    >
    <h2
      v-if="isMobile"
      class="text-base font-medium"
      :class="{ 'collapse-title': isMobile, 'p-4': isMobile }"
    >
      <i class="ri-map-pin-line text-base mr-1" />
      Navigation
    </h2>
    <div :class="{ 'collapse-content': isMobile }">
      <div class="space-y-3">
        <SelectInput
          label="Mode de navigation"
          :entries="modeOptions"
          :model-value="mapStore.navigationMode"
          @update:model-value="handleModeChange"
        />

        <template v-if="mapStore.navigationMode === 'thematic'">
          <SelectInput
            label="Thématique"
            :entries="categoryOptions"
            :model-value="selectedCategory || ''"
            @update:model-value="handleCategoryChange"
          />

          <SelectInput
            v-if="selectedCategory"
            label="Carte"
            :entries="thematicMapOptions"
            :model-value="mapStore.currentMapId || ''"
            @update:model-value="handleMapChange"
          />
        </template>

        <template v-else>
          <SelectInput
            label="Jeu de données"
            :entries="datasetMapOptions"
            :model-value="mapStore.currentMapId || ''"
            @update:model-value="handleMapChange"
          />
        </template>
      </div>
    </div>
  </div>
</template>
