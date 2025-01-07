<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, Package, Trophy, UserPlus } from 'lucide-vue-next'

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
    _id: '3',
    type: 'BID_PLACED',
    message: 'Your bid of $500 has been placed for "Antique Vase"',
    auctionId: 'auction456',
    read: true,
    createdAt: '2025-01-06T08:00:00',
    preview: 'Bid Placed',
  },
  {
    _id: '4',
    type: 'AUCTION_WON',
    message: 'Congratulations! You won the auction for "Rare Coins"',
    auctionId: 'auction789',
    read: false,
    createdAt: '2025-01-06T07:00:00',
    preview: 'Auction Won!',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
  {
    _id: '5',
    type: 'OUTBID',
    message: 'Someone has outbid you on "Vintage Camera"',
    auctionId: 'auction101',
    read: true,
    createdAt: '2025-01-06T06:00:00',
    preview: 'Outbid Alert',
  },
])

const tabs = ref('all')

const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

const filteredNotifications = computed(() => notifications.value)

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

const markAllAsRead = () => {
  notifications.value = notifications.value.map((notification) => ({
    ...notification,
    read: true,
  }))
}
</script>

<template>
  <div class="container space-y-6 p-10 pb-16">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight">Notifications</h2>
      <Button variant="outline" @click="markAllAsRead">Mark all as read</Button>
    </div>

    <Tabs default-value="all" v-model:value="tabs" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" class="ml-2">{{ notifications.length }}</Badge>
        </TabsTrigger>
        <TabsTrigger value="unread">
          Unread
          <Badge variant="secondary" class="ml-2">
            {{ notifications.filter((n) => !n.read).length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="auctions">Auctions</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <ScrollArea class="h-[600px] mt-4">
        <TabsContent value="all">
          <div
            v-for="notification in notifications"
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
            v-for="notification in notifications.filter((n) => !n.read)"
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
            v-for="notification in notifications.filter((n) =>
              ['AUCTION_REMINDER', 'BID_PLACED', 'AUCTION_WON', 'OUTBID'].includes(n.type),
            )"
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
            v-for="notification in notifications.filter((n) => n.type === 'REGISTRATION')"
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
