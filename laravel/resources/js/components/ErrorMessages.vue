<template>
  <div
    v-if="errors.length > 0"
    class="validation-area fixed flex justify-between items-center bottom-8 left-4 rounded p-4 pr-3 bg-red-100"
  >
    <ul class="grid gap-y-1 mr-4">
      <li v-for="msg in errors" :key="msg" class="text-red-600 md:text-base text-xs">
        {{ msg }}
      </li>
    </ul>
    <button type="button" class="flex items-center" @click="onClick">
      <ion-icon name="close-outline"></ion-icon>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    errors: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  methods: {
    onClick() {
      this.$emit("clear");
    },
  },
};
</script>
<style>
.validation-area {
  max-width: calc(100vw - 4rem);
}
</style>
