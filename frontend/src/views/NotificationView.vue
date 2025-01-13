<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, Package, Trophy, UserPlus } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notificationStore.ts'
import { onEvent } from '@/services/websocket.ts'

const notificationStore = useNotificationStore()

const tabs = ref('all')

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

// onMounted(() => {
//   notificationStore.fetchNotifications()
// })
</script>

<template>
  <div class="container space-y-6 p-10 pb-16">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight">Notifications</h2>
      <Button variant="outline" @click="notificationStore.markAllAsRead">Mark all as read</Button>
    </div>

    <Tabs default-value="all" v-model:value="tabs" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" class="ml-2">{{
            notificationStore.notifications.length
          }}</Badge>
        </TabsTrigger>
        <TabsTrigger value="unread">
          Unread
          <Badge variant="secondary" class="ml-2">
            {{ notificationStore.unreadNotifications.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="auctions">Auctions</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <ScrollArea class="h-[600px] mt-4">
        <TabsContent value="all">
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification._id"
            class="flex items-start space-x-4 p-4 transition-colors cursor-pointer"
            :class="notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-gray-50'"
          >
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                class="h-5 w-5 text-gray-500"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="notification.read ? 'text-gray-900' : 'text-blue-900'">
                {{ notification.message }}
              </p>
              <div class="mt-1 text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unread">
          <div
            v-for="notification in notificationStore.unreadNotifications"
            :key="notification._id"
            class="flex items-start space-x-4 p-4 transition-colors cursor-pointer"
            :class="notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-gray-50'"
          >
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                class="h-5 w-5 text-gray-500"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="notification.read ? 'text-gray-900' : 'text-blue-900'">
                {{ notification.message }}
              </p>
              <div class="mt-1 text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auctions">
          <div
            v-for="notification in notificationStore.auctionNotifications"
            :key="notification._id"
            class="flex items-start space-x-4 p-4 transition-colors cursor-pointer"
            :class="notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-gray-50'"
          >
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                class="h-5 w-5 text-gray-500"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="notification.read ? 'text-gray-900' : 'text-blue-900'">
                {{ notification.message }}
              </p>
              <div class="mt-1 text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div
            v-for="notification in notificationStore.systemNotifications"
            :key="notification._id"
            class="flex items-start space-x-4 p-4 transition-colors cursor-pointer"
            :class="notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-gray-50'"
          >
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                class="h-5 w-5 text-gray-500"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="notification.read ? 'text-gray-900' : 'text-blue-900'">
                {{ notification.message }}
              </p>
              <div class="mt-1 text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</div>
            </div>
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  </div>
</template>
