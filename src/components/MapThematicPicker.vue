<script setup lang="ts">
import type { ThematicCategory } from '@/types/service.types'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useMapStore } from '@/stores/map'
import { THEMATIC_COLORS, THEMATIC_LABELS } from '@/types/service.types'

const mapStore = useMapStore()
const { isMobile } = useBreakpoints()

function getThematicIcon(category: ThematicCategory): string {
  switch (category) {
    case 'logement':
      return 'ri-home-4-line'
    case 'enseignement-superieur-recherche':
      return 'ri-book-open-line'
    case 'eau':
      return 'ri-drop-line'
    case 'guichets':
      return 'ri-building-2-line'
    case 'sante':
      return 'ri-heart-pulse-line'
    default:
      return 'ri-map-pin-line'
  }
}

function getCategoryColorClass(category: ThematicCategory): string {
  const colorName = THEMATIC_COLORS[category]
  switch (colorName) {
    case 'bouteille':
      return 'bg-green-700 text-white hover:bg-green-800'
    case 'ambre':
      return 'bg-amber-600 text-white hover:bg-amber-700'
    case 'outremer':
      return 'bg-blue-700 text-white hover:bg-blue-800'
    case 'amethyste':
      return 'bg-purple-600 text-white hover:bg-purple-700'
    case 'canard':
      return 'bg-teal-600 text-white hover:bg-teal-700'
    default:
      return 'bg-base-300 hover:bg-base-content/10'
  }
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
      name="accordion-thematic-picker"
    >
    <h2
      v-if="isMobile"
      class="text-base font-medium"
      :class="{ 'collapse-title': isMobile, 'p-4': isMobile }"
    >
      Navigation thématique
    </h2>
    <div :class="{ 'collapse-content': isMobile }">
      <div class="space-y-4">
        <div
          v-for="category in mapStore.availableCategories"
          :key="category"
          class="space-y-2"
        >
          <div class="flex items-center gap-2">
            <i :class="`${getThematicIcon(category)} text-xl`" />
            <h3 class="font-semibold text-sm uppercase tracking-wide">
              {{ THEMATIC_LABELS[category] }}
            </h3>
          </div>
          <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="map in mapStore.getMapsByCategory(category)"
              :key="map.id"
              class="btn btn-sm justify-start text-left transition-colors"
              :class="[
                mapStore.currentMapId === map.id
                  ? getCategoryColorClass(category)
                  : 'btn-ghost',
              ]"
              @click="mapStore.setCurrentMap(map.id)"
            >
              {{ map.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
