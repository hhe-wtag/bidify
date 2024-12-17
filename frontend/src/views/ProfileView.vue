<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold">User Profile</h1>

    <!-- Show Loading Spinner -->
    <div v-if="loading" class="mt-4">
      <p>Loading profile...</p>
      <div class="spinner mt-4"></div>
    </div>

    <!-- Show Profile Details -->
    <div v-else-if="userStore.profile" class="mt-4 space-y-2">
      <p>
        <strong>Name:</strong> {{ userStore.profile.firstName }} {{ userStore.profile.lastName }}
      </p>
      <p><strong>Email:</strong> {{ userStore.profile.email }}</p>
      <p><strong>Contact Number:</strong> {{ userStore.profile.contactNumber }}</p>
      <p><strong>Balance:</strong> {{ userStore.profile.balance }}</p>
      <p>
        <strong>Registration Date:</strong>
        {{ new Date(userStore.profile.registrationDate).toLocaleString() }}
      </p>
    </div>

    <!-- Show Error Message -->
    <p v-else class="text-red-500">
      Unable to load profile details.
      <span v-if="userStore.error">{{ userStore.error }}</span>
      <span v-else>Please try again.</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'

const userStore = useUserStore()
const loading = ref(true) // Reactive state for loading

onMounted(async () => {
  try {
    await userStore.fetchUserProfile() // Fetch user profile from store
  } catch (error) {
    // Log the error (optional, you may also display it directly on the UI)
    console.error('Error occurred:', error.message)
    // You can handle the error further here if necessary, e.g., displaying a toast notification
  } finally {
    loading.value = false // Set loading to false after the request completes
  }
})
</script>
