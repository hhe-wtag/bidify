<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import Navbar from './components/shared/Navbar.vue'
import TooltipProvider from './components/ui/tooltip/TooltipProvider.vue'
</script>

<template>
  <TooltipProvider>
    <div class="flex min-h-screen flex-col">
      <Navbar class="flex-none" />
      <main class="flex-1">
        <router-view />
      </main>
      <Toaster />
    </div>
  </TooltipProvider>
</template>

<style>
:root {
  --navbar-height: 3.6rem;
}

.min-h-screen-minus-nav {
  min-height: calc(100vh - var(--navbar-height));
}
</style>
