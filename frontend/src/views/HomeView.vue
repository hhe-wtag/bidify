<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user.ts'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/profile')
  }
})

const navigateToLogin = () => router.push('/login')
const navigateToRegister = () => router.push('/register')
</script>

<template>
  <div
    class="min-h-screen-minus-nav bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center"
  >
    <!-- Hero Section -->
    <div class="container mx-auto px-4">
      <div class="text-center space-y-8 max-w-4xl mx-auto">
        <!-- Brand -->
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900">Bidify</h1>

        <!-- Tagline -->
        <p class="text-2xl md:text-3xl font-medium text-gray-700">
          Your Premier Online Auction Marketplace
        </p>

        <!-- Description -->
        <div class="max-w-2xl mx-auto">
          <p class="text-lg text-gray-600">
            Join Bidify to discover unique items, place competitive bids, and sell your valuable
            possessions in a secure and user-friendly environment. Start your bidding journey today!
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="flex justify-center gap-4 pt-8">
          <Button size="lg" variant="default" @click="navigateToLogin">Sign In</Button>
          <Button size="lg" variant="outline" @click="navigateToRegister">Create Account</Button>
        </div>
      </div>
    </div>
  </div>
</template>
