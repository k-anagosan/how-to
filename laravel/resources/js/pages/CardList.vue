<template>
  <div class="pagetop-offset">
    <ul
      v-if="list"
      class="cardlist xl:mx-40 mx-4 grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6"
    >
      <Card v-for="article in list" :key="article.id" :article="article" />
    </ul>
    <Pagination v-if="pagination" :pagination="pagination" />
  </div>
</template>
<script>
import Card from "../components/Card.vue";
import Pagination from "../components/Pagination.vue";

export default {
  components: {
    Card,
    Pagination,
  },
  props: {
    page: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      list: null,
      pagination: null,
    };
  },
  watch: {
    $route: {
      async handler() {
        [this.list, this.pagination] = [null, null];
        await this.fetchArticleList();
      },
      immediate: true,
    },
  },
  methods: {
    async fetchArticleList() {
      const response = await this.$store.dispatch(
        "post/getArticleList",
        this.page
      );
      if (!response) return;
      this.list = response.data;
      delete response.data;
      this.pagination = response;
    },
  },
};
</script>
