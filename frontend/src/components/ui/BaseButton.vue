<template>
  <button
    :class="[
      'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>
