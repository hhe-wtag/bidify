<template>
  <div class="space-y-2">
    <h4 class="text-md font-medium flex items-center gap-2">
      <component :is="iconComponent" class="h-5 w-5" />
      {{ label }}
    </h4>
    <p class="text-md text-muted-foreground">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Calendar, Phone, DollarSign, User, MapPin } from 'lucide-vue-next'

const icons = {
  Mail,
  Calendar,
  Phone,
  DollarSign,
  User,
  MapPin,
}

const props = defineProps<{
  icon: keyof typeof icons
  label: string
  value: string
}>()

const iconComponent = computed(() => icons[props.icon])
</script>
