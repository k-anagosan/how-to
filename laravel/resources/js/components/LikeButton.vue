<template>
  <button
    type="button"
    class="rounded-full bg-blue-200 flex justify-center items-center outline-none focus:outline-none hover:shadow-lg text-red transition-shadow"
    :class="`icon-size-${size}`"
    @click.stop="onClick"
  >
    <ion-icon
      v-if="!isLiked"
      :class="{ 'text-xl': size === 'lg' }"
      class="transition-colors"
      name="heart-outline"
    ></ion-icon>
    <ion-icon v-if="isLiked" :class="{ 'text-xl': size === 'lg' }" class="transition-colors" name="heart"></ion-icon>
  </button>
</template>

<script>
import { mapGetters } from "vuex";
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
  computed: {
    ...mapGetters({
      username: "auth/username",
    }),
  },
  methods: {
    onClick() {
      if (!this.username) {
        this.$router.push("/login");
        return;
      }
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

<style>
button:hover ion-icon[name="heart-outline"] {
  color: rgba(248, 113, 113, 1);
}

ion-icon[name="heart"] {
  color: rgba(248, 113, 113, 1);
}
</style>
