<template>
  <footer
    class="flex items-center justify-center h-20 sm:h-24 w-full bg-blue-400"
  >
    <button v-if="isLogin" class="px-4" @click="logout">Logout</button>
    <RouterLink v-else to="/login" class="px-4"> Login / Register </RouterLink>
  </footer>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  computed: {
    ...mapGetters({
      isLogin: "auth/isAuthenticated",
    }),
    ...mapState({
      apiIsSuccess: state => state.auth.apiIsSuccess,
    }),
  },
  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      if (this.apiIsSuccess && this.$route.path !== "/") this.$router.push("/");
    },
  },
};
</script>

<style></style>
