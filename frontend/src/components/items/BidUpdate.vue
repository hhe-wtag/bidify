<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '@/components/ui/stepper'
import { onEvent } from '@/services/websocket.js'
import { joinItemRoom } from '@/services/bidSocketEvents.ts'
import { useItemStore } from '@/stores/item.ts'
import { CircleDollarSign, CircleDot, Database } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { useBidStore } from '@/stores/bid.ts'

const itemStore = useItemStore()
const bidStore = useBidStore()

onMounted(() => {
  console.log('Bid on mounted')
  onEvent('user-joined', (data) => {
    console.log(data.user.email)
    bidStore.addConnectedUsers(data.user.email)
  })
  if (itemStore.currentItem?.slug) {
    joinItemRoom(itemStore.currentItem?.slug)
  }
})

const steps = [
  {
    step: 1,
    title: '$1,500.00',
    description: 'Bid placed at 2:30 PM by John Smith',
  },
  {
    step: 2,
    title: '$1,450.00',
    description: 'Bid placed at 2:28 PM by Sarah Johnson',
  },
  {
    step: 3,
    title: '$1,400.00',
    description: 'Bid placed at 2:25 PM by Michael Brown',
  },
  {
    step: 4,
    title: '$1,400.00',
    description: 'Bid placed at 2:25 PM by Michael Brown',
  },
  {
    step: 5,
    title: '$1,400.00',
    description: 'Bid placed at 2:25 PM by Michael Brown',
  },
  {
    step: 6,
    title: '$1,400.00',
    description: 'Bid placed at 2:25 PM by Michael Brown',
  },
]
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
        <StepperItem
          v-for="(step, index) in steps"
          :key="step.step"
          class="relative flex w-full items-start gap-6"
          :step="step.step"
        >
          <StepperSeparator
            v-if="step.step !== steps[steps.length - 1].step"
            class="absolute left-[18px] top-[38px] block h-[80%] w-0.5 shrink-0 rounded-full bg-muted"
          />

          <div
            class="z-10 rounded-full shrink-0 p-1 relative"
            :class="{ 'latest-bid': index === 0 }"
          >
            <div
              v-if="index === 0"
              class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,white,#9ca3af)] animate-ping opacity-75"
            ></div>
            <div class="relative rounded-full">
              <CircleDollarSign
                v-if="index === 0"
                class="size-8 bg-white rounded-full text-gray-700"
              />
              <CircleDot v-else class="size-8 text-gray-500" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <StepperTitle class="text-sm font-semibold transition lg:text-base">
              {{ step.title }}
            </StepperTitle>
            <StepperDescription class="text-xs text-muted-foreground transition lg:text-sm">
              {{ step.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </Stepper>
    </CardContent>
  </Card>
</template>
<style lang="css">
.scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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
