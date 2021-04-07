<template>
  <header class="absolute top-0 w-full bg-blue-200">
    <nav
      class="sm:container flex justify-between items-center h-full px-8 sm:px-16 mx-auto"
    >
      <RouterLink to="/" class="text-xl h-full flex items-center">
        How-to
      </RouterLink>
      <div class="hidden sm:flex justify-between items-center h-full">
        <div v-if="isLogin" class="submit-button px-4 h-full flex items-center">
          <RouterLink to="/edit" class="edit-button">Edit Post</RouterLink>
        </div>
        <span
          v-if="isLogin"
          class="header-username px-4 h-full flex items-center"
          >{{ username }}</span
        >
        <div v-else class="px-4 h-full flex items-center">
          <RouterLink to="/login" class="login-link w-full">
            Login / Register
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  computed: {
    isLogin() {
      return this.$store.getters["auth/isAuthenticated"];
    },
    username() {
      return this.$store.getters["auth/username"];
    },
  },
};
</script>
