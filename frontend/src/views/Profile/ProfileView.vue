<template>
  <div>
    <h3 class="text-lg font-medium">Profile</h3>
    <p class="text-sm text-muted-foreground">Details of your account</p>
  </div>
  <Separator class="mt-8 mb-8" />
  <div v-if="loading" class="flex justify-center items-center flex-col">
    <p>Loading profile...</p>
    <div class="spinner mt-4"></div>
  </div>
  <div v-else-if="userStore.profile" class="space-y-8">
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><User class="h-5 w-5"/>Username</h4>
      <p class="text-md text-muted-foreground">
        {{ userStore.profile.firstName || '' }} {{ userStore.profile.lastName || '' }}
      </p>
    </div>
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><Mail class="h-5 w-5"/>Email</h4>
      <p class="text-md text-muted-foreground">{{ userStore.profile.email || '' }}</p>
    </div>
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><Phone class="h-5 w-5"/>Contact Number</h4>
      <p class="text-md text-muted-foreground">{{ userStore.profile.contactNumber || '' }}</p>
    </div>
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><DollarSign class="h-5 w-5"/>Balance</h4>
      <p class="text-md text-muted-foreground">{{ userStore.profile.balance ?? 'N/A' }}</p>
    </div>
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><Calendar class="h-5 w-5"/>Registration Date</h4>
      <p class="text-md text-muted-foreground">
        {{ new Date(userStore.profile.registrationDate).toLocaleString() }}
      </p>
    </div>
    <div class="space-y-2">
      <h4 class="text-md font-medium flex items-center gap-2"><MapPin class="h-5 w-5"/>Address</h4>
      <div>
        <p class="text-md text-muted-foreground">
          <strong>Street: </strong>
          {{ userStore.profile.address?.street ?? 'N/A' }}
        </p>
        <p class="text-md text-muted-foreground">
          <strong>City: </strong>
          {{ userStore.profile.address?.city ?? 'N/A' }}
        </p>
        <p class="text-md text-muted-foreground">
          <strong>State:</strong>
          {{ userStore.profile.address?.state ?? 'N/A' }}
        </p>
        <p class="text-md text-muted-foreground">
          <strong>Zip Code:</strong> {{ userStore.profile.address?.zipCode ?? 'N/A' }}
        </p>
        <p class="text-md text-muted-foreground">
          
          <strong>Country: </strong>{{ userStore.profile.address?.country ?? 'N/A' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'
import { Mail, Calendar, Phone, DollarSign, User, LogOut, MapPin } from 'lucide-vue-next'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { Separator } from '@/components/ui/separator'

const { handleError } = useErrorHandler()
const userStore = useUserStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await userStore.fetchUserProfile()
  } catch (error) {
    console.error('Error occurred:', handleError(error))
  } finally {
    loading.value = false
  }
})
</script>
