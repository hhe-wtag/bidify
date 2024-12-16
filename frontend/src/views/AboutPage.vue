<template>
  <div class="max-w-md mx-auto mt-10 text-center">
    <h1 class="text-2xl font-bold mb-6">{{ title }}</h1>
    <ui-button @click="goToHome">Go to Home</ui-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import UiButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const appStore = useAppStore()

const title = appStore.title

const goToHome = () => {
  appStore.setTitle('Home')
  router.push('/')
}
</script>
