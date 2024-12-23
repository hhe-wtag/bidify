<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Item, CreateItemData, UpdateItemData } from '@/interfaces/item'
import itemValidationSchema from '@/utils/itemValidationSchema'
import { z } from 'zod'

interface ItemFormProps {
  item?: Item | null
}

const props = defineProps<ItemFormProps>()

const emit = defineEmits<{
  (e: 'submit', data: CreateItemData | UpdateItemData): void
  (e: 'cancel'): void
}>()

const loading = ref(false)

const formData = ref<CreateItemData>({
  title: '',
  description: '',
  startingBid: 0,
  minimumBidIncrement: 0,
  endTime: '',
})

const errors = ref<Record<string, string>>({})

onMounted(() => {
  if (props.item) {
    formData.value = {
      title: props.item.title,
      description: props.item.description,
      startingBid: props.item.startingBid,
      minimumBidIncrement: props.item.minimumBidIncrement,
      endTime: new Date(props.item.endTime).toISOString().slice(0, 16),
    }
  }
})

const handleSubmit = async () => {
  loading.value = true
  errors.value = {}
  try {
    itemValidationSchema.parse(formData.value)
    emit('submit', formData.value)
  } catch (e) {
    if (e instanceof z.ZodError) {
      e.errors.forEach((error) => {
        if (error.path.length > 0) {
          errors.value[error.path[0]] = error.message
        }
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="title">Title</Label>
      <Input id="title" v-model="formData.title" placeholder="Enter item title" required />
      <p v-if="errors.title" class="text-red-500">{{ errors.title }}</p>
    </div>

    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="formData.description"
        placeholder="Enter item description"
        required
      />
      <p v-if="errors.description" class="text-red-500">{{ errors.description }}</p>
    </div>

    <div class="space-y-2">
      <Label for="startingBid">Starting Bid ($)</Label>
      <Input
        id="startingBid"
        v-model.number="formData.startingBid"
        type="number"
        min="0"
        step="0.01"
        required
      />
      <p v-if="errors.startingBid" class="text-red-500">{{ errors.startingBid }}</p>
    </div>

    <div class="space-y-2">
      <Label for="minimumBidIncrement">Minimum Bid Increment ($)</Label>
      <Input
        id="minimumBidIncrement"
        v-model.number="formData.minimumBidIncrement"
        type="number"
        min="0"
        step="0.01"
        required
      />
      <p v-if="errors.minimumBidIncrement" class="text-red-500">{{ errors.minimumBidIncrement }}</p>
    </div>

    <div class="space-y-2">
      <Label for="endTime">End Time</Label>
      <Input id="endTime" v-model="formData.endTime" type="datetime-local" required />
      <p v-if="errors.endTime" class="text-red-500">{{ errors.endTime }}</p>
    </div>

    <DialogFooter>
      <Button type="button" variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :disabled="loading">
        {{ props.item ? 'Update' : 'Create' }}
      </Button>
    </DialogFooter>
  </form>
</template>
