<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SelectInput from '@/components/SelectInput.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

import { useMapStore } from '@/stores/map'

const { isMobile } = useBreakpoints()

const mapStore = useMapStore()
const { currentService } = storeToRefs(mapStore)
</script>

<template>
  <div
    class="bg-base-100"
    :class="{
      'collapse collapse-arrow border border-base-300 ': isMobile,
    }"
  >
    <input
      v-if="isMobile"
      type="checkbox"
      name="accordion-map-controls"
    >
    <!-- Dynamic Controls -->
    <h2
      class="text-base font-medium"
      :class="{ 'collapse-title p-4': isMobile, 'mb-2': !isMobile }"
    >
      <i class="ri-equalizer-2-line text-base mr-1" />
      Contrôles de la carte
    </h2>
    <div :class="{ 'collapse-content': isMobile }">
      <fieldset
        v-if="currentService"
        class="fieldset space-y-2"
      >
        <div
          v-for="control in mapStore.formControls"
          :key="control.key"
        >
          <SelectInput
            :label="control.label"
            :entries="control.entries"
            :model-value="mapStore.getSelectedEntry(control.key)"
            @update:model-value="(value: any) => value && mapStore.setSelectedEntry(control.key, value)"
          />
        </div>
      </fieldset>
    </div>
  </div>
</template>
