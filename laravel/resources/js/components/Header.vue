<template>
  <header class="w-full bg-blue-200">
    <nav class="container flex justify-between items-center h-full lg:px-16 sm:px-8 px-5 mx-auto">
      <RouterLink to="/" class="text-xl h-full flex items-center"> How-to </RouterLink>
      <div class="hidden sm:flex justify-between items-center h-full">
        <div v-if="isLogin" class="submit-button mr-4 h-full flex items-center">
          <RouterLink to="/edit" class="edit-button">Edit Post</RouterLink>
        </div>
        <RouterLink v-if="isLogin" :to="`/user/${username}`" class="userpage-link h-full flex items-center">{{
          username
        }}</RouterLink>
        <div v-else class="h-full flex items-center">
          <RouterLink to="/login" class="login-link w-full"> Login / Register </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      isLogin: "auth/isAuthenticated",
      username: "auth/username",
    }),
  },
};
</script>
