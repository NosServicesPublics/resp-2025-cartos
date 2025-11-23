<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import ActionButtons from '@/components/ActionButtons.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import MainLayout from '@/components/MainLayout.vue'
import MapControls from '@/components/MapControls.vue'
import MapNavigationPicker from '@/components/MapNavigationPicker.vue'
import MapRenderer from '@/components/MapRenderer.vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()
const { currentService, currentRenderer, geoData } = storeToRefs(mapStore)

onMounted(async () => {
  // Check if there are URL parameters to restore state
  const urlParams = new URLSearchParams(window.location.search)

  if (urlParams.has('map')) {
    // Initialize from URL parameters
    await mapStore.initializeFromUrlParams(urlParams)
  }
  else {
    // Initialize with default state
    await mapStore.initialize()
  }
})

const mapPlot = ref<any>(null)

watch([
  currentService,
  currentRenderer,
  geoData,
], () => {
  if (!currentService.value || !currentRenderer.value || !geoData.value) {
    return null
  }
  mapPlot.value = currentRenderer.value(geoData.value, currentService.value)
}, { immediate: true, deep: true })
</script>

<template>
  <div class="bg-base-200">
    <div class="px-4 sm:px-0 flex-grow">
      <AppHeader />
      <main class="md:min-h-[calc(100vh-4rem)] container mx-auto py-12 flex flex-col">
        <MainLayout class="flex-1">
          <template #top>
            <MapNavigationPicker />
          </template>
          <template #main>
            <Transition
              name="fade"
              mode="out-in"
            >
              <MapRenderer
                v-if="currentService && mapPlot"
                class="map-renderer w-full h-full"
                :map-plot="mapPlot"
              />
            </Transition>
          </template>
          <template #right-top>
            <MapControls />
          </template>
          <template #right-bottom>
            <ActionButtons />
          </template>
        </MainLayout>
      </main>
    </div>
  </div>
  <AppFooter />
</template>
