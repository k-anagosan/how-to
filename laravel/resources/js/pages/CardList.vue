<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div v-if="!loading" class="pagetop-offset">
      <ul
        v-if="list"
        class="cardlist xl:mx-40 mx-4 grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6"
      >
        <Card v-for="article in list" :key="article.id" :article="article" />
      </ul>
      <Pagination v-if="pagination" :pagination="pagination" />
    </div>
  </div>
</template>
<script>
import Card from "../components/Card.vue";
import Pagination from "../components/Pagination.vue";
import Spinner from "../components/Spinner.vue";

export default {
  components: {
    Card,
    Pagination,
    Spinner,
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
      loading: false,
    };
  },
  watch: {
    $route: {
      async handler() {
        [this.list, this.pagination] = [null, null];
        this.loading = true;
        await this.fetchArticleList();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchArticleList() {
      const response = await this.$store.dispatch("post/getArticleList", this.page);
      if (!response) return;
      this.list = response.data;
      delete response.data;
      this.pagination = response;
    },
  },
};
</script>
