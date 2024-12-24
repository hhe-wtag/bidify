<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <Card class="w-[500px]">
      <CardHeader>
        <div class="flex flex-col items-center">
          <Avatar>
            <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <CardTitle class="mt-4">User Profile</CardTitle>
          <CardDescription>Details of your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center items-center flex-col">
          <p>Loading profile...</p>
          <div class="spinner mt-4"></div>
        </div>

        <div v-else-if="userStore.profile" class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <User class="h-5 w-5 text-gray-600" />
              <span>
                <strong>Name:</strong> {{ userStore.profile.firstName || 'N/A' }}
                {{ userStore.profile.lastName || 'N/A' }}
              </span>
            </div>

            <div class="flex items-center space-x-2">
              <Mail class="h-5 w-5 text-gray-600" />
              <span> <strong>Email:</strong> {{ userStore.profile.email || 'N/A' }} </span>
            </div>

            <div class="flex items-center space-x-2">
              <Phone class="h-5 w-5 text-gray-600" />
              <span>
                <strong>Contact Number:</strong> {{ userStore.profile.contactNumber || 'N/A' }}
              </span>
            </div>

            <div class="flex items-center space-x-2">
              <DollarSign class="h-5 w-5 text-gray-600" />
              <span> <strong>Balance:</strong> {{ userStore.profile.balance ?? 'N/A' }} </span>
            </div>

            <div class="flex items-center space-x-2">
              <Calendar class="h-5 w-5 text-gray-600" />
              <span>
                <strong>Registration Date:</strong>
                {{ new Date(userStore.profile.registrationDate).toLocaleString() }}
              </span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <MapPin class="h-5 w-5 text-gray-600" />
                <span><strong>Address:</strong></span>
              </div>
              <div class="pl-12 text-gray-700">
                <p>Street: {{ userStore.profile.address?.street ?? 'N/A' }}</p>
                <p>City: {{ userStore.profile.address?.city ?? 'N/A' }}</p>
                <p>State: {{ userStore.profile.address?.state ?? 'N/A' }}</p>
                <p>Zip Code: {{ userStore.profile.address?.zipCode ?? 'N/A' }}</p>
                <p>Country: {{ userStore.profile.address?.country ?? 'N/A' }}</p>
              </div>
            </div>
          </div>

          <Button
            class="w-full mt-4 bg-red-500 hover:bg-red-600 flex items-center justify-center space-x-2"
            @click="handleLogout"
          >
            <LogOut class="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>

        <div v-else class="text-red-500">
          Unable to load profile details.
          <span v-if="userStore.error">{{ userStore.error }}</span>
          <span v-else>Please try again.</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Mail, Calendar, Phone, DollarSign, User, LogOut, MapPin } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const userStore = useUserStore()
const loading = ref(true)
const router = useRouter()

onMounted(async () => {
  if (userStore.profile) {
    loading.value = false
  } else {
    try {
      await userStore.fetchUserProfile()
      loading.value = false
    } catch (error) {
      handleError(error)
    }
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>
