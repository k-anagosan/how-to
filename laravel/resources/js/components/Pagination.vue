<template>
  <ul v-if="pagination" class="pagination relative my-12 h-12">
    <li v-if="pagination.current_page > 1" class="absolute top-1/2 left-0 -translate-y-1/2 transform">
      <RouterLink :to="`${to}?page=${pagination.current_page - 1}`" class="left-button">
        <div
          class="flex items-center py-2 px-3 border border-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <ion-icon name="arrow-back-outline"></ion-icon>
          <span class="ml-2">{{ left }}</span>
        </div>
      </RouterLink>
    </li>
    <li class="current_page absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform flex items-center">
      {{ pagination.current_page }} / {{ pagination.last_page }}
    </li>
    <li
      v-if="pagination.current_page < pagination.last_page"
      class="absolute top-1/2 right-0 -translate-y-1/2 transform"
    >
      <RouterLink :to="`${to}?page=${pagination.current_page + 1}`" class="right-button">
        <div
          class="flex items-center py-2 px-3 border border-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <span class="mr-2">{{ right }}</span>
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </div>
      </RouterLink>
    </li>
  </ul>
</template>
<script>
export default {
  props: {
    pagination: {
      type: Object,
      required: true,
    },
    left: {
      type: String,
      required: false,
      default: "Newer",
    },
    right: {
      type: String,
      required: false,
      default: "Older",
    },
    to: {
      type: String,
      required: true,
    },
  },
};
</script>
