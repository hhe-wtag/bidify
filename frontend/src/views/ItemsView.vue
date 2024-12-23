<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import ItemForm from '@/components/items/ItemForm.vue'

// Dummy data
const dummyItems = [
  {
    _id: '1',
    title: 'Vintage Watch',
    description: 'A beautiful vintage watch in excellent condition',
    startingBid: 100.0,
    currentBid: 150.0,
    minimumBidIncrement: 10.0,
    endTime: '2024-12-31',
  },
  {
    _id: '2',
    title: 'Antique Vase',
    description: 'Rare antique vase from the 19th century',
    startingBid: 500.0,
    currentBid: null,
    minimumBidIncrement: 50.0,
    endTime: '2024-12-25',
  },
  {
    _id: '3',
    title: 'Classic Camera',
    description: 'Professional film camera from the 1970s',
    startingBid: 250.0,
    currentBid: 300.0,
    minimumBidIncrement: 25.0,
    endTime: '2024-12-28',
  },
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card v-for="item in dummyItems" :key="item._id" class="overflow-hidden">
        <CardHeader>
          <CardTitle>{{ item.title }}</CardTitle>
          <CardDescription>{{ item.description }}</CardDescription>
        </CardHeader>

        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Starting Bid</span>
              <span class="font-medium">${{ item.startingBid.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Current Bid</span>
              <span
                :class="{
                  'font-medium': item.currentBid,
                  'text-muted-foreground text-sm': !item.currentBid,
                }"
              >
                {{ item.currentBid ? `$${item.currentBid.toFixed(2)}` : 'No bids placed yet' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Minimum Increment</span>
              <span class="font-medium">${{ item.minimumBidIncrement.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">End Time</span>
              <span class="font-medium">{{ new Date(item.endTime).toLocaleDateString() }}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2">
          <Button variant="outline" size="sm"> Edit </Button>
          <Button variant="outline" size="sm">View Details</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
