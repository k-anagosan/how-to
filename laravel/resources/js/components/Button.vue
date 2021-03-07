<template>
  <button
    :id="id"
    :type="type"
    class="bg-gray-700 text-white py-1 px-4 rounded-sm focus:bg-white focus:text-gray-700 transition-colors"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: false,
      default: "button",
    },
    id: {
      type: String,
      required: false,
      default: "",
    },
  },
  methods: {
    onClick() {
      this.$emit(this.type);
    },
  },
};
</script>

<style></style>
