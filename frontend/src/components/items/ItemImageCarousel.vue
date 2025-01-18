<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
const props = defineProps({
  images: Array,
})
</script>

<template>
  <Carousel v-slot="{ canScrollNext }" class="relative w-full">
    <CarouselContent>
      <CarouselItem v-for="(image, index) in images" :key="index">
        <div>
          <Card>
            <CardContent class="flex aspect-square items-center justify-center">
              <img :src="image?.filepath" />
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious class="left-4" />
    <CarouselNext class="right-4" v-if="canScrollNext" />
  </Carousel>
</template>
