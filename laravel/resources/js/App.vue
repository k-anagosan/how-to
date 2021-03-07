<template>
  <div class="min-h-screen bg-white relative">
    <Header />
    <main class="sm:container mx-auto pt-32 sm:pt-40 sm:px-20 px-16">
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
