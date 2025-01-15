<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Item, CreateItemData, UpdateItemData } from '@/interfaces/item'
import itemValidationSchema from '@/utils/itemValidationSchema'
import { z } from 'zod'
import { Calendar } from '@/components/ui/calendar'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils.ts'
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
  parseDateTime,
} from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

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

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const items = [
  { value: 0, label: 'Today' },
  { value: 1, label: 'Tomorrow' },
  { value: 3, label: 'In 3 days' },
  { value: 7, label: 'In a week' },
]

const dateTime = ref<DateValue | null>(null)

watch(
  () => dateTime.value,
  (newValue) => {
    if (newValue) {
      const date = newValue.toDate(getLocalTimeZone())
      date.setHours(23, 59, 59)
      formData.value.endTime = new Date(date).toISOString()
    }
  },
)

onMounted(() => {
  if (props.item) {
    formData.value = {
      title: props.item.title,
      description: props.item.description,
      startingBid: props.item.startingBid,
      minimumBidIncrement: props.item.minimumBidIncrement,
      endTime: new Date(props.item.endTime).toISOString(),
    }
    const date = new Date(props.item.endTime)
    const formattedDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0') +
      'T' +
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0') +
      ':' +
      String(date.getSeconds()).padStart(2, '0')

    dateTime.value = parseDateTime(formattedDate)
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
      <Label for="startingBid">Starts from ($)</Label>
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
      <Label for="minimumBidIncrement">Minimum Raise ($)</Label>
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
      <Popover>
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            :class="
              cn('w-full justify-start text-left font-normal', !dateTime && 'text-muted-foreground')
            "
          >
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ dateTime ? df.format(dateTime.toDate(getLocalTimeZone())) : 'Pick a date' }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="flex w-auto flex-col gap-y-2 p-2">
          <Select
            @update:model-value="
              (v) => {
                if (!v) return
                dateTime = today(getLocalTimeZone()).add({ days: Number(v) })
              }
            "
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in items" :key="item.value" :value="item.value.toString()">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Calendar v-model="dateTime" />
        </PopoverContent>
      </Popover>

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
