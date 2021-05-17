<template>
  <button
    class="bg-white border border-gray-300 hover:border-gray-800 transition-colors focus:outline-none"
    :class="{ 'bg-gray-800': isFollowing }"
    @click="onClick"
  >
    <span v-if="isFollowing" class="text-gray-100">Unfollow</span>
    <span v-if="!isFollowing" class="text-gray-900">Follow</span>
  </button>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    isFollowing: {
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
      auth: "auth/isAuthenticated",
    }),
  },
  methods: {
    onClick() {
      if (!this.auth) {
        this.$router.push("/login");
        return;
      }
      if (this.disabled) return;
      this.disabled = true;
      this.$emit("follow", { isFollowing: !this.isFollowing });

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
