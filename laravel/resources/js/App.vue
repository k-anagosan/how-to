<template>
  <div class="min-h-screen relative flex flex-col bg-blue-50">
    <Header class="header-height z-50" />
    <main
      class="min-main-height flex-auto z-0"
      :class="{
        'container mx-auto sm:px-8 md:px-16':
          !$route.path.match(/^\/article\/[a-zA-Z0-9]{20}$/g) && !$route.path.match(/^\/user\/.*$/g),
      }"
    >
      <RouterView />
    </main>
    <Footer v-if="$route.path !== '/edit' && $route.path !== '/login'" />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHENTICATED, UNAUHTORIZED_CLIENT } from "./utils";

export default {
  components: {
    Header,
    Footer,
  },
  computed: {
    errorCode() {
      return this.$store.state.error.errorCode;
    },
  },
  watch: {
    errorCode: {
      handler(errorCode) {
        if (errorCode === INTERNAL_SERVER_ERROR) {
          this.$router.push("/500");
        } else if (errorCode === UNAUTHENTICATED) {
          this.$store.commit("auth/setUser", null);
          this.$router.push("/login");
        } else if (errorCode === UNAUHTORIZED_CLIENT) {
          this.$store.commit("auth/setUser", null);
          this.$router.push("/page-expired");
        } else if (errorCode === NOT_FOUND) {
          if (this.$route.path !== "/not-found") this.$router.replace("/not-found");
        }
      },
      immediate: true,
    },
    $route() {
      this.$store.commit("error/setErrorCode", null);
      this.getCurrentUser();
    },
  },
  methods: {
    async getCurrentUser() {
      await this.$store.dispatch("auth/getCurrentUser");
    },
  },
};
</script>
