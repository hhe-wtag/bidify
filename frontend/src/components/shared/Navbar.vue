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
import {
  LogOut,
  User,
  Bell,
  Clock,
  Package,
  Trophy,
  UserPlus,
  PackageCheck,
  ClipboardList,
  BellRing,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
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
import { formatDate } from '@/utils/timeFunctions'
import { registerPushNotification } from '@/services/pushNotification.ts'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const loadingNotifications = computed(() => notificationStore.loading)
const notifications = computed(() => notificationStore.notifications)

watch(
  () => userStore.isWSConnected,
  (isConnected) => {
    if (isConnected) {
      onBidNotification((data) => {
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onOutBidNotification((data) => {
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onAuctionWinNotification((data) => {
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
      onAuctionEndNotification((data) => {
        const { notification } = data.data
        notificationStore.addNotification(notification)
      })
    }
  },
)

onMounted(async () => {
  try {
    if (userStore.isAuthenticated) {
      await userStore.fetchUserProfile()
      console.log(userStore.userId)
      if (userStore.token && userStore.userId)
        connectSocket(userStore.token, userStore.userId, (WSConnectionStatus) => {
          userStore.setWSConnection(WSConnectionStatus)
        })
      await notificationStore.fetchNotifications()
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

const shakeBell = ref(false)
const notificationSound = ref(new Audio('/sounds/notification.mp3'))
watch(unreadCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    shakeBell.value = true
    notificationSound.value.currentTime = 0
    notificationSound.value.play().catch((err) => {
      console.error('Error playing notification sound:', err)
    })
    setTimeout(() => {
      shakeBell.value = false
    }, 500)
  }
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

const setupPushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('No support for service worker')
    }
    if (!('Notification' in window)) {
      throw new Error('No support for Notification API')
    }

    const requestPermission = async () => {
      let permission = Notification.permission

      if (permission === 'denied') {
        alert(
          'Please enable notifications in your browser settings:\n\n' +
            "1. Click the lock/info icon in your browser's address bar\n" +
            '2. Find "Notifications" in the permissions list\n' +
            '3. Change the setting to "Allow"\n' +
            '4. Refresh the page and try again',
        )
        return false
      }

      if (permission !== 'granted') {
        permission = await Notification.requestPermission()
      }

      return permission === 'granted'
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        await navigator.serviceWorker.ready
        console.log('Service Worker registered successfully:', registration)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        throw new Error('Failed to register service worker')
      }
    }

    const subscribeToPush = async (registration) => {
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
        })

        console.log('Push subscription successful:', subscription)

        await registerPushNotification(subscription)

        new Notification('Push Notifications Enabled', {
          body: 'You will now receive notifications for bids and auction updates',
          icon: '/icon.png',
        })

        return subscription
      } catch (error) {
        console.error('Push subscription failed:', error)
        throw new Error('Failed to subscribe to push notifications')
      }
    }

    const registerPushNotification = async (subscription) => {
      const userId = userStore.userId
      const token = userStore.token

      console.log(`User Id`, userStore.userId)
      if (!userId || !token) {
        console.error('User ID or Token is missing')
        return
      }

      try {
        const response = await fetch('http://localhost:8080/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            subscription: subscription,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          console.log('Subscription successfully saved:', data)
        } else {
          console.error('Error saving subscription:', data)
        }
      } catch (error) {
        console.error('Failed to send subscription to backend:', error)
      }
    }

    const hasPermission = await requestPermission()
    if (!hasPermission) {
      return null
    }

    const registration = await registerSW()
    const subscription = await subscribeToPush(registration)

    return subscription
  } catch (error) {
    console.error('Error setting up push notifications:', error)
  }
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
        <Button
          variant="outline"
          size="icon"
          @click="setupPushNotifications"
          class="w-full flex items-center justify-center gap-2 px-4 py-2"
          title="Enable Push Notifications"
        >
          Subscribe
          <!-- <BellRing style="width: 25px; height: 25px" /> -->
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" class="relative" :class="{ shake: shakeBell }">
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
              Profile Settings
            </DropdownMenuItem>
            <hr />
            <DropdownMenuItem @click="router.push('/user-enlisted-items')">
              <ClipboardList class="mr-2 h-4 w-4" />
              Enlisted Items
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/user-winning-items')">
              <PackageCheck class="mr-2 h-4 w-4" />
              Won Items
            </DropdownMenuItem>
            <hr />
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

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20%,
  60% {
    transform: rotate(-10deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}
</style>
