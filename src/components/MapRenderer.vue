<script setup lang="ts">
import { ref, toRef, watch } from 'vue'

const props = defineProps<{
  mapPlot: HTMLDivElement
}>()

const mapPlot = toRef(props, 'mapPlot')

const mapContainer = ref<HTMLDivElement | null>(null)

watch([mapPlot, mapContainer], ([plot, container]) => {
  if (plot && container) {
    container.innerHTML = ''
    container.appendChild(plot)
  }
})
</script>

<template>
  <div
    ref="mapContainer"
    class="map-container"
  />
</template>

<style scoped>
@import 'tailwindcss';

.map-container {
  background: var(--custom-bg);
  @apply flex flex-col justify-end items-center;
}

/* .map-container:deep(figure) {
} */

.map-container:deep(figure h2) {
  @apply font-semibold;
}

.map-container:deep(h2+svg) {
  @apply max-w-full max-h-full;
}
/* .map-container:deep(svg+svg) {
} */
</style>
