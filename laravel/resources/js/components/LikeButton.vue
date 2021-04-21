<template>
  <button
    type="button"
    class="rounded-full bg-blue-200 flex justify-center items-center outline-none focus:outline-none"
    :class="`icon-size-${size}`"
    @click.stop="onClick"
  >
    <ion-icon v-if="!isLiked" :class="{ 'text-xl': size === 'lg' }" name="heart-outline"></ion-icon>
    <ion-icon v-if="isLiked" :class="{ 'text-xl': size === 'lg' }" name="heart"></ion-icon>
  </button>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      required: false,
      default: "md",
      validator(value) {
        return ["sm", "md", "lg"].indexOf(value) !== -1;
      },
    },
    isLiked: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      disabled: false,
    };
  },
  methods: {
    onClick() {
      if (this.disabled) return;
      this.disabled = true;
      this.$emit("like", { isLiked: !this.isLiked });

      setTimeout(() => {
        this.enable();
      }, 1000);
    },
    enable() {
      this.disabled = false;
    },
  },
};
</script>
