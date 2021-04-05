<template>
  <div class="min-h-screen bg-white relative flex flex-col">
    <Header />
    <main class="min-h-screen container mx-auto sm:px-16 px-8 sm:pt-32 py-24">
      <RouterView />
    </main>
    <Footer v-if="$route.path !== '/edit'" />
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
