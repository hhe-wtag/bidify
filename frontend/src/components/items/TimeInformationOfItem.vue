<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-vue-next'
import { formatDate, calculateTimeRemaining } from '@/utils/timeFunctions.ts'
import type { Item } from '@/interfaces/item.ts'

const props = defineProps<{
  currentItem: Item
}>()

const timeRemaining = ref('')
let timer: number | undefined

const updateTimeRemaining = () => {
  timeRemaining.value = calculateTimeRemaining(props.currentItem.endTime)

  if (timeRemaining.value === 'Auction Ended') {
    clearInterval(timer)
  }
}

onMounted(() => {
  updateTimeRemaining()
  timer = setInterval(updateTimeRemaining, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const getStatusClass = (status?: string) => ({
  'text-green-600': !status || status === 'active',
  'text-red-600': status === 'closed',
})

const getTimeRemainingClass = (remaining: string) => ({
  'text-yellow-600': remaining !== 'Auction Ended',
  'text-red-600': remaining === 'Auction Ended',
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
        <span class="font-medium" :class="getStatusClass(props.currentItem.status)">
          {{ props.currentItem.status || 'Active' }}
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
