# Bidify - Frontend

## Overview

Bidify's frontend is a modern Vue.js application that provides a real-time auction platform interface. Built with Vue 3 and TypeScript, it features a responsive design, real-time updates via WebSocket, and a comprehensive UI component system using shadcn/vue components.

## Tech Stack

- Vue.js 3 with Composition API
- TypeScript
- Vite as build tool
- Pinia for state management
- Socket.io-client for real-time features
- Tailwind CSS for styling
- shadcn/vue for UI components
- Vue Router for navigation
- Zod & VeeValidate for form validation

## Initial Project Setup Steps

1. **Project Prerequisites**

- Node.js >= 18.0.0
- Yarn package manager
- Git

2. **Install & Run**

```bash
# Clone and navigate to project
git clone https://github.com/hhe-wtag/bidify.git
cd bidify/frontend

# Install dependencies
yarn install

# Run Dev Server
yarn dev
```

3. **Environment Setup**

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WEBSOCKET_URL=http://localhost:8080
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Vue components
│   │   ├── items/          # Item-related components
│   │   ├── shared/         # Shared/common components
│   │   └── ui/             # UI components (shadcn/vue)
│   ├── composables/        # Vue composables/hooks
│   ├── interfaces/         # TypeScript interfaces
│   ├── plugins/            # Plugin configurations
│   ├── router/             # Vue Router configuration
│   ├── services/           # External services integration
│   ├── stores/             # Pinia state management
│   ├── utils/              # Utility functions
│   └── views/              # Page components
```

## Key Features

### 1. Real-time Updates

The application uses Socket.IO for real-time features:

```typescript
// services/websocket.ts
import { io } from 'socket.io-client'

export const initializeWebSocket = (token: string) => {
  const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  return socket
}
```

### 2. State Management

Using Pinia for centralized state management:

```typescript
// stores/item.ts
import { defineStore } from 'pinia'
import type { Item } from '@/interfaces/item'

export const useItemStore = defineStore('item', {
  state: () => ({
    items: [] as Item[],
    currentItem: null as Item | null,
  }),

  actions: {
    async fetchItems() {
      try {
        const response = await axios.get('/items')
        this.items = response.data
      } catch (error) {
        handleError(error)
      }
    },
  },
})
```

### 3. Form Handling

Using VeeValidate with Zod for form validation:

```typescript
// utils/itemValidationSchema.ts
import { z } from 'zod'

export const itemSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  startingBid: z.number().positive(),
  minimumBidIncrement: z.number().positive(),
  endTime: z.date().min(new Date()),
})
```

### 4. Component Examples

#### Item Card Component

```vue
<!-- components/items/ItemCard.vue -->
<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>{{ item.title }}</CardTitle>
      <CardDescription> Starting Bid: ${{ item.startingBid }} </CardDescription>
    </CardHeader>
    <CardContent>
      <ItemImageCarousel :images="item.images" />
      <TimeInformationOfItem :endTime="item.endTime" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { Item } from '@/interfaces/item'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

defineProps<{
  item: Item
}>()
</script>
```

#### Bid Update Component

```vue
<!-- components/items/BidUpdate.vue -->
<template>
  <div class="bid-update">
    <Form @submit="onSubmit">
      <FormField name="bidAmount" v-slot="{ field, errors }">
        <FormItem>
          <FormLabel>Your Bid</FormLabel>
          <FormControl>
            <Input v-bind="field" type="number" :min="minimumBid" step="0.01" />
          </FormControl>
          <FormMessage>{{ errors[0] }}</FormMessage>
        </FormItem>
      </FormField>
      <Button type="submit" :disabled="isSubmitting"> Place Bid </Button>
    </Form>
  </div>
</template>
```

## Error Handling

```typescript
// composables/useErrorHandler.ts
import { useToast } from '@/components/ui/toast'

export const useErrorHandler = () => {
  const toast = useToast()

  const handleError = (error: unknown) => {
    const message = getErrorMessage(error)
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  return { handleError }
}
```

## Routing

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/items/:slug',
      component: () => import('@/views/ItemsView.vue'),
    },
    {
      path: '/profile',
      component: () => import('@/views/Profile/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

## WebSocket Events

```typescript
// services/bidSocketEvents.ts
export const setupBidEvents = (socket: Socket) => {
  const bidStore = useBidStore()
  const toast = useToast()

  socket.on('new-bid-placed', (data) => {
    bidStore.updateLatestBid(data)
    toast({
      title: 'New Bid',
      description: `New bid placed: $${data.amount}`,
    })
  })

  socket.on('auction-ended', (data) => {
    bidStore.handleAuctionEnd(data)
  })
}
```

## Development Tips

1. **Component Development**

   - Use shadcn/vue components from `@/components/ui`
   - Create business logic components in feature folders
   - Keep components small and focused

2. **State Management**

   - Use Pinia stores for global state
   - Keep component state local when possible
   - Use composables for reusable logic

3. **Type Safety**

   - Define interfaces for all data structures
   - Use TypeScript decorators when beneficial
   - Leverage Vue's type inference system

4. **Performance**
   - Use dynamic imports for route components
   - Implement virtual scrolling for long lists
   - Optimize images and assets

## Common Issues & Solutions

1. **WebSocket Connection**

   - Verify VITE_WEBSOCKET_URL is correct
   - Check authentication token
   - Ensure proper CORS configuration

2. **Build Issues**

   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

3. **State Management**
   - Use Pinia devtools for debugging
   - Check store subscriptions
   - Verify action/mutation flow
