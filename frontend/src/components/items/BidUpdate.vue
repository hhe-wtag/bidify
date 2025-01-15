<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '@/components/ui/stepper'
import { onNewBidPlaced, onPlaceBid, onPlaceBidResult } from '@/services/bidSocketEvents.ts'
import { useItemStore } from '@/stores/item.ts'
import { ArrowUp, CircleDollarSign, CircleDot } from 'lucide-vue-next'
import { onBeforeMount, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useBidStore } from '@/stores/bid.ts'
import BidUpdateCard from './BidUpdateCard.vue'
import { toast } from '../ui/toast/use-toast.ts'

const itemStore = useItemStore()
const bidStore = useBidStore()
const pulsingItem = ref<number | null>(null)

interface BidResponse {
  bid: {
    statusCode: number
    message: string
  }
}

const handleNewBidPlaced = ({ data }: { data: BidResponse }) => {
  if (data.bid.statusCode === 201) {
    if (itemStore.currentItem?._id) {
      bidStore.fetchLatest10Bids(itemStore.currentItem._id)
    }
    pulsingItem.value = 1
    setTimeout(() => {
      pulsingItem.value = null
    }, 3000)
  }
}

const handlePlacedBidResult = ({ data }: { data: BidResponse }) => {
  if (data.bid.statusCode === 201) {
    toast({
      title: 'Congratulations!',
      description: data.bid.message,
      class: 'bg-green-100',
    })
  } else {
    toast({
      title: 'Something Went Wrong!',
      description: 'Bid cannot be placed at this moment.',
      class: 'bg-red-100',
    })
  }
}

onBeforeMount(() => {
  onNewBidPlaced(handleNewBidPlaced)
  onPlaceBidResult(handlePlacedBidResult)
})

onMounted(() => {
  if (itemStore.currentItem?._id) bidStore.fetchLatest10Bids(itemStore.currentItem?._id)
})

onUnmounted(() => {
  itemStore.clearCurrentItem()
})

const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(-30px)'
}

const onEnter = (el) => {
  const delay = el.dataset.index * 150
  setTimeout(() => {
    el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
  }, delay)
}
</script>

<template>
  <Card class="border rounded-md">
    <CardHeader class="pb-2">
      <CardTitle class="text-2xl text-center font-bold text-gray-800"> Bid History </CardTitle>
    </CardHeader>
    <CardContent class="p-0 pb-6">
      <Stepper
        v-if="bidStore.lates10Bids.length > 0"
        orientation="vertical"
        class="mx-auto flex w-full scrollbar max-h-[600px] overflow-y-auto max-w-lg p-6 flex-col justify-start gap-8"
      >
        <TransitionGroup
          name="bid-update"
          tag="div"
          class="flex flex-col gap-6"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
        >
          <StepperItem
            v-for="(step, index) in bidStore.lates10Bids"
            :key="step.timeOfTheBid"
            class="relative flex w-full items-start gap-4 [&_[data-state]]:!bg-gray-200"
            :step="index"
            :data-index="index"
          >
            <StepperSeparator
              v-if="index !== bidStore.lates10Bids.length - 1"
              class="absolute left-[22px] top-[45px] block h-[calc(100%_-_20px)] w-0.5 shrink-0 rounded-full !bg-gray-200"
              :class="[index === 0 && 'bg-gradient-to-b from-gray-400 to-transparents']"
            />

            <div class="z-10 rounded-full shrink-0 p-1.5 bg-white">
              <div class="relative rounded-full">
                <CircleDollarSign v-if="index === 0" class="size-9 text-primary" />
                <CircleDot v-else class="size-9 text-gray-400 opacity-75" />
              </div>
            </div>
            <div
              class="flex flex-col rounded-xl transition-all duration-300 ease-in-out w-full"
              :class="[
                index === 0 && pulsingItem ? 'ring-pulse scale-[1.02]' : 'hover:scale-[1.02]',
              ]"
            >
              <StepperDescription>
                <BidUpdateCard :step="step" :index="index" />
              </StepperDescription>
            </div>
          </StepperItem>
        </TransitionGroup>
      </Stepper>
      <div v-else>
        <h1 class="text-base text-center text-muted-foreground">No Bids placed for item yet!</h1>
      </div>
    </CardContent>
  </Card>
</template>

<style lang="css">
.bid-update-move {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes ring-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(14 165 233 / 0.3);
  }
  50% {
    box-shadow: 0 0 0 15px rgb(14 165 233 / 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(14 165 233 / 0);
  }
}

.ring-pulse {
  animation: ring-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 100vh;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 100vh;
  transition: all 0.3s;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
