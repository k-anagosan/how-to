<template>
  <h1 class="pagetop-offset">logoutしています...</h1>
</template>
<script>
export default {
  mounted() {
    this.replace();
  },
  methods: {
    replace() {
      this.$router.replace("/");
    },
  },
};
</script>
