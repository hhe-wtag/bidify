<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-vue-next'
import { formatDate, calculateTimeRemaining } from '@/utils/timeFunctions'
import type { Item } from '@/interfaces/item.ts'

const props = defineProps<{
  currentItem: Item
}>()

const timeRemaining = ref('')
let timer: number | undefined

const updateTimeRemaining = () => {
  if (props.currentItem.status !== 'active') {
    timeRemaining.value = '0d 0h 0m 0s'
    return
  }

  timeRemaining.value = calculateTimeRemaining(props.currentItem.endTime)

  if (timeRemaining.value === '0d 0h 0m 0s') {
    clearInterval(timer)
  }
}

onMounted(() => {
  updateTimeRemaining()
  if (props.currentItem.status === 'active') {
    timer = setInterval(updateTimeRemaining, 1000)
  }
})

onUnmounted(() => {
  if (props.currentItem.status === 'active') clearInterval(timer)
})

const getStatusClass = (status?: string) => ({
  'text-green-600': status === 'active',
  'text-yellow-600': status === 'sold',
  'text-gray-400': status === 'canceled',
})

const getTimeRemainingClass = (remaining: string) => ({
  'text-yellow-600': remaining !== '0d 0h 0m 0s',
  'text-red-600': remaining === '0d 0h 0m 0s',
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg flex items-center">
        <Clock class="mr-2 h-5 w-5" />
        Time Information
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-muted-foreground">End Time</span>
        <span class="font-medium">
          {{ formatDate(props.currentItem.endTime) }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-muted-foreground">Status</span>
        <span class="font-medium capitalize" :class="getStatusClass(props.currentItem.status)">
          {{ props.currentItem.status }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-muted-foreground">Time Remaining</span>
        <span class="font-medium" :class="getTimeRemainingClass(timeRemaining)">
          {{ timeRemaining }}
        </span>
      </div>
    </CardContent>
  </Card>
</template>
