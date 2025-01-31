<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useItemStore } from '@/stores/item'
import { useUserStore } from '@/stores/user'
import { useBidStore } from '@/stores/bid'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import TimeInformationOfItem from './TimeInformationOfItem.vue'
import BidUpdate from './BidUpdate.vue'

import { ArrowLeft, DollarSign, PartyPopper } from 'lucide-vue-next'

import { placeBid } from '@/services/bidSocketEvents.ts'
import { z } from 'zod'
import ItemImageCarousel from './ItemImageCarousel.vue'
import { onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const itemStore = useItemStore()
const userStore = useUserStore()
const bidStore = useBidStore()

const slug = route.params.slug as string
const incrementBidAmount = ref(0)

const latestBid = computed(() => bidStore.lates10Bids?.[0] || null)
const currentBidAmount = computed(
  () => itemStore.currentItem?.latestBid || itemStore.currentItem?.startingBid || 0,
)
const minimumBidIncrement = computed(() => itemStore.currentItem?.minimumBidIncrement || 0)
const newLatestBid = computed(() => currentBidAmount.value + incrementBidAmount.value)

const bidCooldownTimer = ref(null)
const bidCooldownActive = ref(false)
const cooldownTimeLeft = ref(0)

// Update the isLatestBidder computed
const isLatestBidder = computed(() => {
  return latestBid.value?.bidderId === userStore.profile?._id && !bidCooldownActive.value
})

// Update the isPlaceBidDisabled computed property
const isPlaceBidDisabled = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return true
  if (bidCooldownActive.value) return true
  if (isLatestBidder.value) return true
  return currentItem.status === 'closed' || currentItem.sellerId === userProfile._id
})
const startBidCooldown = () => {
  bidCooldownActive.value = true
  cooldownTimeLeft.value = 5

  // Clear existing timer if any
  if (bidCooldownTimer.value) {
    clearInterval(bidCooldownTimer.value)
  }

  // Start countdown timer
  bidCooldownTimer.value = setInterval(() => {
    cooldownTimeLeft.value--
    if (cooldownTimeLeft.value <= 0) {
      bidCooldownActive.value = false
      clearInterval(bidCooldownTimer.value)
      bidCooldownTimer.value = null
    }
  }, 1000)
}

// Clean up timer when component unmounts
onUnmounted(() => {
  if (bidCooldownTimer.value) {
    clearInterval(bidCooldownTimer.value)
  }
})

// Update the placeBidDisabledReason
const placeBidDisabledReason = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return 'Item or user not found'
  if (currentItem.status === 'closed') return 'Auction is closed'
  if (currentItem.sellerId === userProfile._id)
    return 'You are the seller of this item, you cannot place bid'
  if (isLatestBidder.value && !bidCooldownActive.value) return 'You already have the highest bid'
  if (bidCooldownActive.value)
    return `Please wait ${cooldownTimeLeft.value} seconds before placing another bid`

  return ''
})

const bidError = ref('')

const bidSchema = computed(() => {
  return z
    .number({
      required_error: 'Bid amount is required',
      invalid_type_error: 'Bid amount must be a number',
    })
    .min(
      itemStore.currentItem.minimumBidIncrement,
      `You must increase latest bid by $${itemStore.currentItem.minimumBidIncrement}`,
    )
})

const validateBidAmount = () => {
  try {
    bidSchema.value.parse(Number(incrementBidAmount.value))
    bidError.value = ''
  } catch (error) {
    if (error instanceof z.ZodError) {
      bidError.value = error.errors[0].message
    }
  }
}

watch(
  () => itemStore.currentItem,
  (newItem) => {
    if (newItem) incrementBidAmount.value = newItem.minimumBidIncrement
  },
  { immediate: true },
)

watch(
  () => bidStore.lates10Bids,
  (newBids) => {
    if (newBids.length > 0) {
      itemStore.updateBidData(newBids[0])
      incrementBidAmount.value = minimumBidIncrement.value
    }
  },
)
const handlePlaceBid = () => {
  if (!itemStore.currentItem || !userStore.profile) return
  if (isLatestBidder.value || bidCooldownActive.value) return

  try {
    bidSchema.value.parse(Number(incrementBidAmount.value))
    bidError.value = ''
    startBidCooldown()

    placeBid({
      itemId: itemStore.currentItem._id,
      bidderId: userStore.profile._id,
      incrementBidAmount: incrementBidAmount.value,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      bidError.value = error.errors[0].message
    }
    bidCooldownActive.value = false
  }
}

onMounted(() => {
  if (slug) itemStore.fetchItemBySlug(slug)
})
</script>

<template>
  <div class="container mx-auto px-12">
    <Button variant="ghost" class="my-4" @click="router.push('/items')">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Items
    </Button>

    <div v-if="itemStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <Alert v-else-if="itemStore.error" variant="destructive" class="mb-6">
      <AlertDescription>{{ itemStore.error }}</AlertDescription>
    </Alert>

    <div v-else-if="itemStore.currentItem" class="flex flex-col lg:flex-row gap-4">
      <Card class="flex flex-col lg:flex-row gap-4 w-[90vw] lg:w-2/3">
        <CardHeader class="flex-1 lg:pr-0">
          <ItemImageCarousel :images="itemStore.currentItem.images" />
          <CardTitle class="text-2xl pt-2">{{ itemStore.currentItem.title }}</CardTitle>
          <CardDescription class="text-base max-h-20 overflow-y-auto">
            {{ itemStore.currentItem.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="p-0 px-4 lg:px-0 lg:pr-4 my-6 w-full lg:w-[45%]">
          <div class="flex flex-col gap-4">
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
                  <Transition name="fade" mode="out-in">
                    <span
                      :key="itemStore.currentItem.latestBid"
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
                  </Transition>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Minimum Raise</span>
                  <span class="font-medium">
                    + ${{ itemStore.currentItem.minimumBidIncrement.toFixed(2) }}
                  </span>
                </div>
              </CardContent>
            </Card>

            <TimeInformationOfItem :currentItem="itemStore.currentItem" />
          </div>

          <div>
            <div v-if="itemStore.currentItem.status === 'sold' && latestBid?.bidderName">
              <h1 class="text-center text-xl mt-6">
                Winner of this item is
                <span class="font-bold italic">{{ latestBid.bidderName }}</span>
                <PartyPopper class="size-8 ms-1 inline-block" />
              </h1>
            </div>
            <div
              v-if="itemStore.currentItem.status === 'active'"
              class="relative flex flex-col items-center gap-2 mx-auto pt-4"
            >
              <h1 class="text-lg">
                New price for the item will be
                <span class="font-bold italic">${{ newLatestBid }}</span>
              </h1>

              <div class="flex flex-col justify-center items-center gap-4">
                <div>
                  <span>Raise your bid by $</span>
                  <Input
                    v-model="incrementBidAmount"
                    type="number"
                    :min="itemStore.currentItem.minimumBidIncrement"
                    step="1.0"
                    class="inline w-20 ml-2"
                    :disabled="isPlaceBidDisabled"
                    @update:modelValue="validateBidAmount"
                  />
                </div>
                <Tooltip :delay-duration="0">
                  <TooltipTrigger>
                    <Button
                      size="lg"
                      :disabled="isPlaceBidDisabled || bidError !== ''"
                      @click="handlePlaceBid"
                    >
                      {{ bidCooldownActive ? `Wait ${cooldownTimeLeft}s` : 'Place Bid' }}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" v-if="isPlaceBidDisabled">
                    {{ placeBidDisabledReason }}
                  </TooltipContent>
                </Tooltip>
                <span v-if="bidError" class="absolute bottom-[-26px] pt-2 text-sm text-red-500">{{
                  bidError
                }}</span>
              </div>
            </div>
            <div v-if="itemStore.currentItem.status === 'canceled'">
              <h1 class="text-base text-center text-muted-foreground">The auction is canceled!</h1>
            </div>
          </div>
        </CardContent>
      </Card>
      <BidUpdate class="flex-1 w-[90vw] lg:w-auto" />
    </div>

    <Alert v-else variant="destructive" class="mb-6">
      <AlertDescription>Item not found</AlertDescription>
    </Alert>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
