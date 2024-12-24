<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

const { isAuthenticated, profile } = userStore

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <!-- Brand -->
      <div class="flex cursor-pointer" @click="router.push('/')">
        <h2 class="text-xl font-bold">Bidify</h2>
      </div>

      <!-- Navigation -->
      <div class="flex-1" />

      <!-- Auth Section -->
      <div v-if="isAuthenticated" class="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                {{ profile?.firstName?.[0]?.toUpperCase() }}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="router.push('/profile')">
              <User class="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleLogout">
              <LogOut class="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div v-else class="flex items-center gap-4">
        <Button variant="ghost" @click="router.push('/login')">Login</Button>
        <Button variant="default" @click="router.push('/register')">Register</Button>
      </div>
    </div>
  </nav>
</template>
