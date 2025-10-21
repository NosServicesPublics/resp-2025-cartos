<script lang="ts" setup>
import type { InputEntry } from '@/types/service.types'

defineProps<{
  label: string
  entries: InputEntry[]
}>()

const id = `select-input-${Math.random().toString(36).substring(2, 15)}`

const selected = defineModel<string>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      class="label"
      :for="`#${id}`"
    >
      {{ label }}
    </label>
    <select
      :id="id"
      v-model="selected"
      class="select select-bordered cursor-pointer w-full"
    >
      <option
        v-for="entry in entries"
        :key="entry.key"
        :value="entry.key"
      >
        {{ entry.label }}
      </option>
    </select>
  </div>
</template>
