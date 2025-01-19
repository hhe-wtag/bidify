<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import placeHolderImage from '@/assets/product-placeholder.jpg'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
const props = defineProps<{
  images: { filepath: string }[]
}>()
const handleImageError = (event) => {
  event.target.src = placeHolderImage
}
</script>

<template>
  <Carousel v-slot="{ canScrollNext }" class="relative w-full">
    <CarouselContent>
      <CarouselItem v-for="(image, index) in props.images" :key="index">
        <div>
          <Card>
            <CardContent class="flex aspect-square items-center justify-center p-0">
              <img
                :src="image?.filepath"
                class="h-full w-full object-cover rounded-sm"
                @error="handleImageError"
              />
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious class="left-4" />
    <CarouselNext class="right-4" v-if="canScrollNext" />
  </Carousel>
</template>
