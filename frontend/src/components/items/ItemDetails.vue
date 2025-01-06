<script setup lang="ts">
/// <reference types="node" />
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Clock, DollarSign } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user.ts'
import Tooltip from '../ui/tooltip/Tooltip.vue'
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue'
import TooltipContent from '../ui/tooltip/TooltipContent.vue'
import Input from '../ui/input/Input.vue'
import BidUpdate from '@/components/items/BidUpdate.vue'

const router = useRouter()
const route = useRoute()
const itemStore = useItemStore()
const userStore = useUserStore()

const timeRemaining = ref('')
let timer: NodeJS.Timeout

const updateTimeRemaining = () => {
  const endTime = new Date(itemStore.currentItem?.endTime || '').getTime()
  const now = new Date().getTime()
  const distance = endTime - now

  if (distance < 0) {
    timeRemaining.value = 'Auction Ended'
    clearInterval(timer)
    return
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  timeRemaining.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
}

const minimumBidAmount = computed(() => {
  const currentItem = itemStore.currentItem
  if (!currentItem) return 0

  return currentItem.latestBid
    ? currentItem.latestBid + currentItem.minimumBidIncrement
    : currentItem.startingBid
})

const bidAmountToPlace = ref(minimumBidAmount.value)

watch(
  () => minimumBidAmount.value,
  (newValue) => {
    bidAmountToPlace.value = newValue
  },
)

onMounted(async () => {
  const slug = route.params.slug as string
  if (slug) {
    await itemStore.fetchItemBySlug(slug)
  }
  updateTimeRemaining()
  timer = setInterval(updateTimeRemaining, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTimeRemaining = (endTime: string) => {
  const end = new Date(endTime)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return 'Auction ended'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${days}d ${hours}h ${minutes}m remaining`
}

const isPlaceBidDisabled = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return true

  return (
    currentItem.status === 'closed' ||
    getTimeRemaining(currentItem.endTime) === 'Auction ended' ||
    currentItem.sellerId === userProfile._id
  )
})

const placeBidDisabledReason = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return 'Item or user not found'

  if (currentItem.status === 'closed') return 'Auction is closed'
  if (getTimeRemaining(currentItem.endTime) === 'Auction ended') return 'Auction ended'
  if (currentItem.sellerId === userProfile._id)
    return 'You are the seller of this item, you cannot place bid.'

  return ''
})
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <Button variant="ghost" class="mb-6" @click="router.push('/items')">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Items
    </Button>

    <!-- Loading State -->
    <div v-if="itemStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error State -->
    <Alert v-else-if="itemStore.error" variant="destructive" class="mb-6">
      <AlertDescription>{{ itemStore.error }}</AlertDescription>
    </Alert>

    <!-- Item Details -->
    <div v-else-if="itemStore.currentItem" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl">{{ itemStore.currentItem.title }}</CardTitle>
          <CardDescription class="text-lg">
            {{ itemStore.currentItem.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Bid Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg flex items-center">
                  <DollarSign class="mr-2 h-5 w-5" />
                  Bid Information
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Starts from</span>
                  <span class="font-medium">
                    ${{ itemStore.currentItem.startingBid.toFixed(2) }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Latest Bid</span>
                  <span
                    :class="{
                      'font-medium': itemStore.currentItem.latestBid,
                      'text-muted-foreground text-sm': !itemStore.currentItem.latestBid,
                    }"
                  >
                    {{
                      itemStore.currentItem.latestBid
                        ? `$${itemStore.currentItem.latestBid.toFixed(2)}`
                        : 'No bids placed yet'
                    }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Minimum Raise</span>
                  <span class="font-medium">
                    + ${{ itemStore.currentItem.minimumBidIncrement.toFixed(2) }}
                  </span>
                </div>
              </CardContent>
            </Card>

            <!-- Time Information -->
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
                    {{ formatDate(itemStore.currentItem.endTime) }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Status</span>
                  <span
                    class="font-medium"
                    :class="{
                      'text-green-600':
                        !itemStore.currentItem.status || itemStore.currentItem.status === 'active',
                      'text-red-600': itemStore.currentItem.status === 'closed',
                    }"
                  >
                    {{ itemStore.currentItem.status || 'Active' }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Time Remaining</span>
                  <span
                    class="font-medium"
                    :class="{
                      'text-yellow-600': timeRemaining !== 'Auction Ended',
                      'text-red-600': timeRemaining === 'Auction Ended',
                    }"
                  >
                    {{ timeRemaining }}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Place Bid Button -->
          <div class="flex justify-center">
            <Input
              v-model="bidAmountToPlace"
              type="number"
              min="itemStore.currentItem.minimumBidIncrement"
              step="1.0"
              class="w-48 mr-4"
            />
            <Tooltip :delay-duration="0">
              <TooltipTrigger>
                <Button size="lg" :disabled="isPlaceBidDisabled"> Place Bid </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" v-if="isPlaceBidDisabled">
                {{ placeBidDisabledReason }}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
      <BidUpdate />
    </div>

    <!-- Not Found State -->
    <Alert v-else variant="destructive" class="mb-6">
      <AlertDescription>Item not found</AlertDescription>
    </Alert>
  </div>
</template>
