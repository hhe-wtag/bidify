<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useUserStore } from '@/stores/user'
import { useBidStore } from '@/stores/bid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, DollarSign } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import TimeInformationOfItem from './TimeInformationOfItem.vue'
import BidUpdate from './BidUpdate.vue'
import { calculateTimeRemaining } from '@/utils/TimeFunctions.ts'
import { placeBid } from '@/services/bidSocketEvents.ts'

const router = useRouter()
const route = useRoute()
const itemStore = useItemStore()
const userStore = useUserStore()
const bidStore = useBidStore()

const slug = route.params.slug as string
const incrementBidAmount = ref(0)

const currentBidAmount = computed(
  () => itemStore.currentItem?.latestBid || itemStore.currentItem?.startingBid || 0,
)

const minimumBidIncrement = computed(() => itemStore.currentItem?.minimumBidIncrement || 0)

const newLatestBid = computed(() => currentBidAmount.value + incrementBidAmount.value)

watch(
  () => itemStore.currentItem,
  (newItem) => {
    if (newItem) {
      incrementBidAmount.value = newItem.minimumBidIncrement
    }
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

  placeBid({
    itemId: itemStore.currentItem._id,
    bidderId: userStore.profile._id,
    incrementBidAmount: incrementBidAmount.value,
  })
}

onMounted(() => {
  if (slug) {
    itemStore.fetchItemBySlug(slug)
  }
})

const isPlaceBidDisabled = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return true

  return (
    currentItem.status === 'closed' ||
    calculateTimeRemaining(currentItem.endTime) === 'Auction Ended' ||
    currentItem.sellerId === userProfile._id
  )
})

const placeBidDisabledReason = computed(() => {
  const currentItem = itemStore.currentItem
  const userProfile = userStore.profile

  if (!currentItem || !userProfile) return 'Item or user not found'
  if (currentItem.status === 'closed') return 'Auction is closed'
  if (calculateTimeRemaining(currentItem.endTime) === 'Auction Ended') return 'Auction ended'
  if (currentItem.sellerId === userProfile._id)
    return 'You are the seller of this item, you cannot place bid'

  return ''
})
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <Button variant="ghost" class="mb-6" @click="router.push('/items')">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Items
    </Button>

    <div v-if="itemStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <Alert v-else-if="itemStore.error" variant="destructive" class="mb-6">
      <AlertDescription>{{ itemStore.error }}</AlertDescription>
    </Alert>

    <div v-else-if="itemStore.currentItem" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl">{{ itemStore.currentItem.title }}</CardTitle>
          <CardDescription class="text-lg">
            {{ itemStore.currentItem.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
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

          <div class="flex flex-col items-center gap-4 mx-auto pt-4">
            <h1 class="text-xl">
              New price for the item will be
              <span class="font-bold italic">${{ newLatestBid }}</span>
            </h1>

            <div class="flex justify-center items-center gap-2">
              <span>Raise your bid by $</span>
              <Input
                v-model="incrementBidAmount"
                type="number"
                :min="itemStore.currentItem.minimumBidIncrement"
                step="1.0"
                class="w-20 mr-4"
              />
              <Tooltip :delay-duration="0">
                <TooltipTrigger>
                  <Button size="lg" :disabled="isPlaceBidDisabled" @click="handlePlaceBid">
                    Place Bid
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" v-if="isPlaceBidDisabled">
                  {{ placeBidDisabledReason }}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
      <BidUpdate />
    </div>

    <Alert v-else variant="destructive" class="mb-6">
      <AlertDescription>Item not found</AlertDescription>
    </Alert>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
