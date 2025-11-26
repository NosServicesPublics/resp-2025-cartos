<script setup lang="ts">
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile } = useBreakpoints()
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
      <slot />
    </div>
  </div>
</template>
