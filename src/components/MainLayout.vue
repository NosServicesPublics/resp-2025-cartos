<script setup lang="ts">
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile } = useBreakpoints()
</script>

<template>
  <div
    class="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_1fr_1fr]"
    :class="{
      'bg-base-100 shadow-md border rounded-md border-base-300 p-6 gap-6': !isMobile,
    }"
  >
    <div class="md:col-span-3 row-start-1 pb-2">
      <slot name="top" />
    </div>
    <div
      class="md:col-span-2 row-start-3 md:row-start-2 md:row-end-4 md:self-center"
      :class="{
        'bg-base-100 shadow-md border-x border-t rounded-t-md border-base-300 p-4': isMobile,
      }"
    >
      <slot name="main" />
    </div>
    <div class="md:col-span-1 row-start-2 pb-4 md:self-end xl:pr-16">
      <slot name="right-top" />
    </div>
    <div
      class="md:col-span-1 row-start-4 md:row-start-3 md:self-start xl:pr-16"
      :class="{
        'bg-base-100 shadow-md border-x border-b rounded-b-md border-base-300 p-4': isMobile,
      }"
    >
      <slot name="right-bottom" />
    </div>
  </div>
</template>
