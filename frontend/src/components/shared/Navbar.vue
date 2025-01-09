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
import { LogOut, User, Bell, Clock, Package, Trophy, UserPlus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue'
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { connectSocket } from '@/services/websocket.ts'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.isAuthenticated) {
    if (userStore.token) connectSocket(userStore.token)
    userStore.fetchUserProfile()
  }
})

const firstLetter = computed(() => {
  return userStore.profile?.firstName?.[0]?.toUpperCase()
})

const firstName = computed(() => {
  const firstName = userStore.profile?.firstName || ''
  return firstName ? `${firstName}` : 'User'
})

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const notifications = ref([
  {
    _id: '1',
    type: 'REGISTRATION',
    message: 'Welcome to Bidify! Your account has been successfully created.',
    read: false,
    createdAt: '2025-01-06T10:00:00',
    preview: 'New Account',
  },
  {
    _id: '2',
    type: 'AUCTION_REMINDER',
    message: 'Reminder: The auction for "Vintage Watch" ends in 30 minutes!',
    auctionId: 'auction123',
    read: false,
    createdAt: '2025-01-06T09:30:00',
    preview: 'Auction Ending Soon',
  },
  {
    _id: '2',
    type: 'AUCTION_REMINDER',
    message: 'Reminder: The auction for "Vintage Watch" ends in 30 minutes!',
    auctionId: 'auction123',
    read: false,
    createdAt: '2025-01-06T09:30:00',
    preview: 'Auction Ending Soon',
  },
  {
    _id: '2',
    type: 'AUCTION_REMINDER',
    message: 'Reminder: The auction for "Vintage Watch" ends in 30 minutes!',
    auctionId: 'auction123',
    read: false,
    createdAt: '2025-01-06T09:30:00',
    preview: 'Auction Ending Soon',
  },
  {
    _id: '2',
    type: 'AUCTION_REMINDER',
    message: 'Reminder: The auction for "Vintage Watch" ends in 30 minutes!',
    auctionId: 'auction123',
    read: false,
    createdAt: '2025-01-06T09:30:00',
    preview: 'Auction Ending Soon',
  },
])

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'REGISTRATION':
      return UserPlus
    case 'AUCTION_REMINDER':
      return Clock
    case 'BID_PLACED':
      return Package
    case 'AUCTION_WON':
      return Trophy
    default:
      return Bell
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center gap-16">
      <!-- Brand -->
      <div class="flex cursor-pointer">
        <h2 class="text-2xl font-bold">
          <router-link to="/items">Bidify</router-link>
        </h2>
      </div>

      <!-- Navigation -->
      <div class="flex-1">
        <ul class="flex gap-4 font-bold text-base">
          <li>
            <router-link to="/profile" class="hover:text-primary hover:underline"
              >Profile</router-link
            >
          </li>
          <li>
            <router-link to="/items" class="hover:text-primary hover:underline">Items</router-link>
          </li>
        </ul>
      </div>

      <!-- Auth Section -->
      <div v-if="userStore.isAuthenticated" class="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" class="relative">
              <Bell style="width: 25px; height: 25px" />
              <Badge
                v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 px-1 py-0.5 text-xs bg-red-500 text-white rounded"
              >
                {{ unreadCount }}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-80">
            <div class="flex items-center justify-between px-4 py-2">
              <span class="font-semibold">Notifications</span>
              <router-link to="/notification" class="text-xs text-primary hover:underline">View All</router-link>
            </div>
            <DropdownMenuSeparator />
            <ScrollArea class="h-[300px]">
              <DropdownMenuItem
                v-for="notification in notifications"
                :key="notification._id"
                class="flex flex-col p-4"
              >
                <div class="flex w-full gap-2">
                  <component
                    :is="getNotificationIcon(notification.type)"
                    class="h-4 w-4 text-gray-500"
                  />
                  <div class="flex-1 space-y-1">
                    <p :class="['text-sm', notification.read ? 'text-gray-600' : 'font-medium']">
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                <div class="text-lg font-semibold">{{ firstLetter }}</div>
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <div class="px-2 py-1.5 text-sm">
              Hello, <span class="font-bold">{{ firstName }}</span>
            </div>
            <DropdownMenuSeparator />
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
