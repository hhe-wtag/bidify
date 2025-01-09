<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '@/components/ui/stepper'
import { onNewBid } from '@/services/bidSocketEvents.ts'
import { useItemStore } from '@/stores/item.ts'
import { ArrowUp, CircleDollarSign, CircleDot } from 'lucide-vue-next'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useBidStore } from '@/stores/bid.ts'

const itemStore = useItemStore()
const bidStore = useBidStore()

const pulsingItem = ref(null)

const handleNewBid = ({ data }) => {
  console.log(data)
  if (true) {
    bidStore.fetchLatest10Bids(itemStore.currentItem?._id)

    // Apply pulse effect to the latest bid
    pulsingItem.value = 0

    // Remove the pulse effect after 3 seconds
    setTimeout(() => {
      pulsingItem.value = null
    }, 3000)
  }
}

onBeforeMount(() => {
  onNewBid(handleNewBid)
})

onMounted(() => {
  bidStore.fetchLatest10Bids(itemStore.currentItem?._id)
})

onUnmounted(() => {
  itemStore.clearCurrentItem()
})

const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(-30px)'
}

const onEnter = (el, done) => {
  const delay = el.dataset.index * 100
  setTimeout(() => {
    el.style.transition = 'all 0.5s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
  }, delay)
}

const latest9Bids = computed(() => {
  const bids = bidStore.lates10Bids || []
  return bids.slice(0, bids.length - 1)
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl text-center">Bid Update</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <Stepper
        orientation="vertical"
        class="mx-auto flex w-full scrollbar max-h-[250px] overflow-y-auto max-w-lg p-4 flex-col justify-start gap-6"
      >
        <TransitionGroup
          name="bid-update"
          tag="div"
          class="flex flex-col gap-4"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
        >
          <StepperItem
            v-for="(step, index) in latest9Bids"
            :key="step.timeOfTheBid"
            class="relative flex w-full items-start gap-2"
            :step="index"
            :data-index="index"
          >
            <StepperSeparator
              v-if="index !== latest9Bids.length - 1"
              class="absolute left-[18px] top-[37px] block h-[78%] w-0.5 shrink-0 rounded-full bg-gray-200 group-data-[state=completed]:bg-gray-200 group-data-[disabled]:bg-gray-200"
            />

            <div class="z-10 rounded-full shrink-0 p-1">
              <div class="relative rounded-full">
                <CircleDollarSign v-if="index === 0" class="size-8 text-gray-500" />
                <CircleDot v-else class="size-8 text-gray-500" />
              </div>
            </div>
            <div
              class="flex flex-col gap-1 p-2 rounded ring-transition"
              :class="['border border-gray-200', 0 === index && 'ring-pulse']"
            >
              <StepperTitle class="text-sm font-semibold transition lg:text-base">
                $ {{ step.bidAmount }}
              </StepperTitle>
              <StepperDescription class="text-xs text-muted-foreground transition lg:text-sm">
                <span v-if="index < bidStore.lates10Bids.length - 1" class="flex items-center mb-1">
                  <ArrowUp class="size-3 me-1" />
                  Price Increased ${{
                    (step.bidAmount - bidStore.lates10Bids[index + 1]?.bidAmount).toFixed(2)
                  }}
                </span>
                <span class="italic text-sm">
                  {{ step.bidderName || 'Someone' }}
                </span>
                placed this bid at
                {{ new Date(step.timeOfTheBid).toLocaleTimeString() }}
              </StepperDescription>
            </div>
          </StepperItem>
        </TransitionGroup>
      </Stepper>
    </CardContent>
  </Card>
</template>

<style lang="css">
.bid-update-move {
  transition: all 0.5s ease;
}

@keyframes ring-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.2);
  }

  100% {
    box-shadow: 0 0 0 18px rgba(107, 114, 128, 0);
  }
}

.ring-pulse {
  animation: ring-pulse 1.5s ease-out 5;
}

/* Add transition for ring color changes */
.ring-transition {
  transition: all 0.3s ease-in-out;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #c9c9c9;
  border-radius: 100vh;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aeaeae;
}
</style>
