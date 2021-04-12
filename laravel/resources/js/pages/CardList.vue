<template>
  <div class="pagetop-offset">
    <ul
      v-if="list"
      class="xl:mx-40 mx-4 grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6"
    >
      <li v-for="article in list" :key="article.id" class="shadow-md">
        <RouterLink :to="`/article/${article.id}`">
          <figure class="article-card-image">
            <img alt="" />
          </figure>
          <div class="flex flex-col bg-white sm:p-6 p-4 min-card-height">
            <p class="mb-2">{{ article.author.name }}</p>
            <h2 class="mb-4 flex-auto font-bold">{{ article.title }}</h2>
            <ul v-if="article.tags" class="flex flex-wrap">
              <li
                v-for="tag in article.tags"
                :key="tag.name"
                class="inline-block px-1 mr-1 mb-1 border text-sm"
              >
                <RouterLink to="/">
                  {{ tag.name }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </RouterLink>
      </li>
    </ul>
    <ul v-if="pagination" class="relative xl:mx-40 mx-4 my-12 h-12">
      <li
        v-show="pagination.current_page > 1"
        class="absolute top-1/2 left-0 -translate-y-1/2 transform"
      >
        <RouterLink :to="`/?page=${pagination.current_page - 1}`">
          <div class="flex items-center p-2 pl-0">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span class="ml-2">Newer</span>
          </div>
        </RouterLink>
      </li>
      <li
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform flex items-center"
      >
        {{ pagination.current_page }} / {{ pagination.last_page }}
      </li>
      <li
        v-if="pagination.current_page < pagination.last_page"
        class="absolute top-1/2 right-0 -translate-y-1/2 transform"
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
export default {
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
      this.list = response.data;
      delete response.data;
      this.pagination = response;
    },
  },
};
</script>
