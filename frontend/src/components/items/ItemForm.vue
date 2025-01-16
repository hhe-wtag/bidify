<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'canceled', label: 'Canceled' },
]

const availableStatus = computed(() => {
  const currentStatus = props.item?.status

  // If the item is sold, no status update is allowed
  if (currentStatus === 'sold') return []

  // If the item is active, allow selecting sold or canceled
  if (currentStatus === 'active') {
    return statusOptions.filter((status) => ['sold', 'canceled'].includes(status.value))
  }

  // If the item is canceled, allow selecting active
  if (currentStatus === 'canceled') {
    return statusOptions.filter((status) => status.value === 'active')
  }

  // Default to returning no options if status doesn't match known conditions
  return []
})

// Reset function
const handleReset = () => {
  formData.value.status = props.item?.status // Reset the status in your form data
}

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const datePresets = [
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
      status: props.item.status,
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

const disabledButton = computed(() => {
  return loading.value || props.item?.status === 'sold'
})
const handleSubmit = async () => {
  loading.value = true
  errors.value = {}
  try {
    itemValidationSchema.parse(formData.value)
    const submitFormData = new FormData()

    Object.entries(formData.value).forEach(([key, value]) => {
      submitFormData.append(key, value.toString())
    })

    selectedFiles.value.forEach((file) => {
      submitFormData.append('images', file)
    })

    emit('submit', submitFormData)
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

// Add a separate ref for files since they need special handling
const selectedFiles = ref<File[]>([])

// Preview URLs for selected images
const imagePreviewUrls = ref<string[]>([])

const removeImage = (index: number) => {
  // Revoke the URL for the removed image
  if (imagePreviewUrls.value[index]) {
    URL.revokeObjectURL(imagePreviewUrls.value[index])
  }

  // Remove the file and preview URL from their respective arrays
  imagePreviewUrls.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  // Convert FileList to Array and store files
  const files = Array.from(input.files)
  selectedFiles.value = files

  // Generate preview URLs
  imagePreviewUrls.value = files.map((file) => URL.createObjectURL(file))
  console.log(imagePreviewUrls.value)
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
    <div class="space-y-2" v-if="item?.status">
      <Label for="status">Status</Label>
      <Select
        @update:model-value="
          (v) => {
            if (!v) return
            formData.status = v
          }
        "
      >
        <SelectTrigger>
          <SelectValue :placeholder="item?.status || 'Select a status'" class="capitalize" />
        </SelectTrigger>
        <SelectContent>
          <!-- Add a reset option -->
          <SelectItem value="item?.status" @click="handleReset" class="capitalize">
            {{ item?.status }}
          </SelectItem>

          <!-- Render other options dynamically -->
          <SelectItem v-for="status in availableStatus" :key="status.value" :value="status.value">
            {{ status.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <p v-if="errors.startingBid" class="text-red-500">{{ errors.startingBid }}</p>
    </div>
    <div class="space-y-2">
      <Label for="images">Upload Images of the Item</Label>
      <Input
        id="images"
        type="file"
        @change="handleFileChange"
        accept="image/*"
        multiple
        class="cursor-pointer"
      />

      <!-- Image previews -->
      <div v-if="imagePreviewUrls.length" class="grid grid-cols-3 gap-4 mt-4">
        <div v-for="(url, index) in imagePreviewUrls" :key="index" class="relative group">
          <img
            :src="url"
            class="w-full h-18 object-cover rounded-lg"
            :alt="`Preview ${index + 1}`"
          />
          <button
            @click.prevent="() => removeImage(index)"
            class="absolute top-[-4px] right-[-4px] h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center text-sm font-medium"
          >
            <span class="sr-only">Remove image</span>
            x
          </button>
        </div>
      </div>
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
              <SelectItem
                v-for="datePreset in datePresets"
                :key="datePreset.value"
                :value="datePreset.value.toString()"
              >
                {{ datePreset.label }}
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

      <Tooltip :delay-duration="0">
        <TooltipTrigger>
          <Button :type="'submit'" :disabled="disabledButton">
            {{ props.item ? 'Update' : 'Create' }}
          </Button>
        </TooltipTrigger>
        <TooltipContent :side="'bottom'">Cannot update a sold listing</TooltipContent>
      </Tooltip>
    </DialogFooter>
  </form>
</template>
