<template>
  <div class="min-h-screen relative flex flex-col bg-blue-50">
    <Header class="sm:h-20 h-16 z-50" />
    <main class="min-main-height flex-auto container mx-auto sm:px-8 z-0">
      <RouterView />
    </main>
    <Footer v-if="$route.path !== '/edit' && $route.path !== '/login'" />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { INTERNAL_SERVER_ERROR } from "./utils";

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
        }
      },
      immediate: true,
    },
    $route() {
      this.$store.commit("error/setErrorCode", null);
    },
  },
};
</script>
