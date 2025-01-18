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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { connectSocket } from '@/services/websocket.ts'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  onAuctionEndNotification,
  onAuctionWinNotification,
  onBidNotification,
  onOutBidNotification,
} from '@/services/notificationSocketEvents.ts'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const loadingNotifications = computed(() => notificationStore.loading)
const notifications = computed(() => notificationStore.notifications)

onMounted(async () => {
  try {
    if (userStore.isAuthenticated) {
      await userStore.fetchUserProfile()
      if (userStore.token && userStore.userId) connectSocket(userStore.token, userStore.userId)
      await notificationStore.fetchNotifications()
      onBidNotification((data) => {
        console.log('Received place-bid-notification:', data)
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onOutBidNotification((data) => {
        console.log('Received outbid-notification:', data)
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onAuctionWinNotification((data) => {
        console.log('Received auction-win-notification:', data)
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onAuctionEndNotification((data) => {
        console.log('Received auction-end-notification:', data)
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
    }
  } catch (error) {
    console.error('Error occurred:', error)
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

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5)
})

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
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
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
              <router-link to="/notification" class="text-xs text-primary hover:underline"
                >View All</router-link
              >
            </div>
            <DropdownMenuSeparator />
            <ScrollArea class="h-[300px]">
              <div v-if="loadingNotifications" class="flex items-center justify-center py-4">
                <span>Loading...</span>
              </div>
              <DropdownMenuItem
                v-for="notification in recentNotifications"
                :key="notification._id"
                class="flex flex-col p-4"
              >
                <div class="flex w-full gap-2">
                  <component
                    :is="getNotificationIcon(notification.type)"
                    class="h-4 w-4 text-gray-500"
                  />
                  <div class="flex-1 space-y-1">
                    <p
                      :class="[
                        'text-sm',
                        notification.read ? 'text-gray-600' : 'font-medium text-blue-600',
                      ]"
                    >
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
