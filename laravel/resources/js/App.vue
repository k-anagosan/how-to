<template>
  <div class="min-h-screen bg-white relative">
    <Header />
    <main class="sm:container mx-auto sm:pt-40 pt-24 sm:px-16 px-8">
      <RouterView />
    </main>
    <Footer />
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
