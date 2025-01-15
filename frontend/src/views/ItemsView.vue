<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Ref } from 'vue'

import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useUserStore } from '@/stores/user'

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
import type { CreateItemData, Item, UpdateItemData } from '@/interfaces/item'
import { useNotificationStore } from '@/stores/notificationStore.ts'

const router = useRouter()
const itemStore = useItemStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const searchQuery = ref('')
const showForm = ref(false)
const selectedItem: Ref<Item | null> = ref(null)

onMounted(async () => {
  await itemStore.fetchAllItems()
})

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return [...itemStore.items].reverse()

  return itemStore.items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
    .reverse()
})

const isItemOwner = (item: Item): boolean => {
  return item.sellerId === userStore.profile?._id
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const openCreateForm = (): void => {
  selectedItem.value = null
  showForm.value = true
}

const openEditForm = (item: Item): void => {
  selectedItem.value = item
  showForm.value = true
}

const closeForm = (): void => {
  selectedItem.value = null
  showForm.value = false
}

const handleFormSubmit = async (formData: CreateItemData | UpdateItemData): Promise<void> => {
  const response = selectedItem.value
    ? await itemStore.updateItem(selectedItem.value._id, formData as UpdateItemData)
    : await itemStore.createItem(formData as CreateItemData)

  if (response.success) {
    closeForm()
  } else {
    // Optionally, you can show a toast notification or alert
    console.error('Error during form submission:', response.message)
  }
}
</script>

<template>
  <div class="container space-y-6 py-6">
    <!-- Header and Search -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Items</h1>
      <div class="flex gap-4">
        <div class="relative w-64">
          <Input v-model="searchQuery" placeholder="Search items..." class="pl-8" type="search" />
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button @click="openCreateForm">Add Item</Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="itemStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error State -->
    <Alert v-if="itemStore.error" variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ itemStore.error }}</AlertDescription>
    </Alert>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="text-center py-8 text-muted-foreground">
      {{ searchQuery ? 'No items match your search' : 'No items available' }}
    </div>

    <!-- Grid Layout -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card v-for="item in filteredItems" :key="item.slug" class="overflow-hidden flex flex-col">
        <CardHeader class="flex-1">
          <CardTitle>{{ item.title }}</CardTitle>
          <CardDescription>{{ item.description }}</CardDescription>
        </CardHeader>

        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Starts from</span>
              <span class="font-medium">${{ item.startingBid.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Latest Bid</span>
              <span
                :class="{
                  'font-medium': item.latestBid,
                  'text-muted-foreground text-sm': !item.latestBid,
                }"
              >
                {{ item.latestBid ? `$${item.latestBid.toFixed(2)}` : 'No bids placed yet' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">Minimum Raise</span>
              <span class="font-medium">+ ${{ item.minimumBidIncrement.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">End Time</span>
              <span class="font-medium">{{ formatDate(item.endTime) }}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2">
          <Button v-if="isItemOwner(item)" variant="outline" size="sm" @click="openEditForm(item)">
            Edit
          </Button>
          <Button variant="outline" size="sm" @click="router.push(`items/${item.slug}`)"
            >View Details</Button
          >
        </CardFooter>
      </Card>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog :open="showForm" @update:open="(value) => !value && closeForm()">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ selectedItem ? 'Edit Item' : 'Create New Item' }}</DialogTitle>
          <DialogDescription>
            {{ selectedItem ? 'Update the item details below' : 'Enter the item details below' }}
          </DialogDescription>
        </DialogHeader>
        <ItemForm :item="selectedItem" @submit="handleFormSubmit" @cancel="closeForm" />
      </DialogContent>
    </Dialog>
  </div>
</template>
