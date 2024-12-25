<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const sidebarNavItems = [
  {
    title: 'Profile',
    route: { name: 'profile' },
  },
  {
    title: 'Update Profile',
    route: { name: 'update-profile' },
  },
  {
    title: 'Change Password',
    route: { name: 'change-password' },
  },
]

const navigateTo = (route: object) => {
  router.push(route)
}
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      variant="ghost"
      :class="
        cn(
          'w-full text-left justify-start',
          $route.name === item.route.name && 'bg-muted hover:bg-muted',
        )
      "
      @click="navigateTo(item.route)"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>
