<template>
  <div class="pagetop-offset">
    <ul
      v-if="list"
      class="cardlist xl:mx-40 mx-4 grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6"
    >
      <Card v-for="article in list" :key="article.id" :article="article" />
    </ul>
    <ul v-if="pagination" class="pagination relative xl:mx-40 mx-4 my-12 h-12">
      <li
        v-if="pagination.current_page > 1"
        class="newer absolute top-1/2 left-0 -translate-y-1/2 transform"
      >
        <RouterLink :to="`/?page=${pagination.current_page - 1}`">
          <div class="flex items-center p-2 pl-0">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span class="ml-2">Newer</span>
          </div>
        </RouterLink>
      </li>
      <li
        class="current_page absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform flex items-center"
      >
        {{ pagination.current_page }} / {{ pagination.last_page }}
      </li>
      <li
        v-if="pagination.current_page < pagination.last_page"
        class="older absolute top-1/2 right-0 -translate-y-1/2 transform"
      >
        <RouterLink
          :to="`/?page=${pagination.current_page + 1}`"
          class="flex items-center"
        >
          <div class="flex items-center p-2 pr-0">
            <span class="mr-2">Older</span>
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
<script>
import Card from "../components/Card.vue";

export default {
  components: {
    Card,
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
