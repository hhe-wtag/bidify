<script setup lang="ts">
import { ArrowUp, Clock, History, User } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'

interface BidStep {
  bidAmount: number
  incrementAmount: number
  bidderName: string
  timeOfTheBid: string
}

defineProps<{
  step: BidStep
  index: number
}>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTimeAgo = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
</script>

<template>
  <div
    class="w-full relative flex flex-col gap-3 p-5 rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-sm"
  >
    <!-- Bid Amount -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-3xl font-bold text-primary tracking-tight">
          {{ formatCurrency(step.bidAmount) }}
        </span>
        <div
          class="w-fit flex items-center bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-sm font-medium"
        >
          <ArrowUp class="size-4 me-1.5 stroke-[2.5]" />
          {{ formatCurrency(step.incrementAmount) }}
        </div>
      </div>
      <div
        v-if="index === 0"
        class="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full mt-4"
      >
        <History class="size-4 me-1.5" />
        Latest Bid
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-t border-gray-200/80 w-full" />

    <!-- Bidder Info -->
    <div class="flex items-center gap-3">
      <div class="flex-shrink-0">
        <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User class="size-5 text-primary" />
        </div>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="font-semibold text-gray-800">
          {{ step.bidderName || 'Anonymous Bidder' }}
        </span>
        <div class="flex items-center text-xs text-gray-500 gap-2">
          <Clock class="size-3" />
          <span>{{ formatDate(step.timeOfTheBid) }}</span>
        </div>
      </div>
    </div>

    <!-- Time Ago -->
    <div
      class="absolute top-5 right-5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full"
    >
      {{ getTimeAgo(step.timeOfTheBid) }}
    </div>
  </div>
</template>
