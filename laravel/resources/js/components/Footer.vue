<template>
  <footer
    class="flex absolute bottom-0 items-center justify-center h-20 sm:h-24 w-full bg-blue-400"
  >
    <button class="px-4" @click="logout">Logout</button>
    <RouterLink to="/login" class="px-4"> Login / Register </RouterLink>
  </footer>
</template>

<script>
export default {
  methods: {
    async logout() {
      await this.$store.dispatch("auth/logout");
      if (this.$route.path !== "/") this.$router.push("/");
    },
  },
};
</script>

<style></style>
