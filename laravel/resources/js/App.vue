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

export default {
  components: {
    Header,
    Footer,
  },
};
</script>
