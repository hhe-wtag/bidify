<script setup lang="ts">
import type { Item } from '@/interfaces/item.ts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.ts'
import { Edit } from 'lucide-vue-next'
import Tooltip from '../ui/tooltip/Tooltip.vue'
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue'
import TooltipContent from '../ui/tooltip/TooltipContent.vue'
import { computed } from 'vue'

const props = defineProps<{
  items: Item[]
}>()

const router = useRouter()
const userStore = useUserStore()

const isItemOwner = (item: Item): boolean => {
  return item.sellerId === userStore.profile?._id
}

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

const emit = defineEmits(['openEditForm'])

// Create a handler function to prevent event bubbling
const handleEdit = (event, item) => {
  event.stopPropagation()
  emit('openEditForm', item)
}

const getBadges = (item: Item) => {
  const badges = []
  const now = new Date()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const twentyFourHoursMs = 24 * 60 * 60 * 1000

  // Check if item has ended
  if (new Date(item?.endTime) < now) {
    badges.push({ text: 'Ended', style: 'bg-gray-100 text-gray-800' })
    return badges
  }

  // If item was created within last 7 days
  if (new Date(item?.createdAt) > new Date(now - sevenDaysMs)) {
    badges.push({ text: 'New', style: 'bg-blue-100 text-blue-800' })
  }

  // Check if item ends within 24 hours
  if (
    new Date(item?.endTime) < new Date(now.getTime() + twentyFourHoursMs) &&
    new Date(item?.endTime) > now
  ) {
    badges.push({ text: 'Ending Soon', style: 'bg-red-100 text-red-800' })
  }

  // If item has bids
  if (item?.latestBid) {
    badges.push({ text: 'Active Bids', style: 'bg-green-100 text-green-800' })
  }

  return badges
}
</script>

<template>
  <Card
    v-for="item in props.items"
    :key="item.slug"
    class="relative overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl bg-card cursor-pointer"
    @click="router.push(`items/${item.slug}`)"
  >
    <!-- Card Header -->
    <CardHeader class="flex-1">
      <CardTitle class="text-xl font-bold tracking-tight">
        {{ item.title }}
      </CardTitle>
      <!-- Insert the computed badges if any -->
      <div class="flex flex-wrap gap-2">
        <div
          v-for="badge in getBadges(item)"
          :key="badge.text"
          class="w-fit px-3 py-1 rounded-full text-xs font-medium"
          :class="badge.style"
        >
          {{ badge.text }}
        </div>
      </div>
      <CardDescription class="line-clamp-2 mt-2">
        {{ item.description }}
      </CardDescription>
    </CardHeader>

    <!-- Card Content -->
    <CardContent>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <!-- Starting Bid -->
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">Starting Bid</p>
            <p class="text-sm font-medium">${{ item.startingBid.toFixed(2) }}</p>
          </div>

          <!-- Latest Bid -->
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">Latest Bid</p>
            <p :class="['text-sm font-medium', !item.latestBid && 'text-muted-foreground text-xs']">
              {{ item.latestBid ? `$${item.latestBid.toFixed(2)}` : 'No bids placed yet' }}
            </p>
          </div>

          <!-- Minimum Raise -->
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">Minimum Raise</p>
            <p class="text-sm font-medium text-primary">
              + ${{ item.minimumBidIncrement.toFixed(2) }}
            </p>
          </div>

          <!-- End Time -->
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">End Time</p>
            <p class="text-sm font-medium">{{ formatDate(item.endTime) }}</p>
          </div>
        </div>
      </div>
    </CardContent>

    <!-- Card Footer -->
    <CardFooter class="flex" :class="isItemOwner(item) ? 'justify-between' : 'justify-end'">
      <!-- Edit Button with Tooltip -->

      <Tooltip v-if="isItemOwner(item)" :delay-duration="0">
        <TooltipTrigger>
          <Button variant="ghost" size="sm" @click="handleEdit($event, item)">
            <Edit />
            Edit Item
          </Button>
        </TooltipTrigger>
        <TooltipContent :side="'bottom'">Update your listing details</TooltipContent>
      </Tooltip>

      <Button
        variant="outline"
        size="sm"
        class="hover:bg-primary hover:text-primary-foreground transition-colors"
        @click.stop="router.push(`items/${item.slug}`)"
      >
        View Details
      </Button>
    </CardFooter>
  </Card>
</template>
