<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div
      v-if="!loading"
      id="userpage"
      class="container mx-auto flex lg:flex-row flex-col lg:px-32 sm:p-8 pagetop-offset"
    >
      <aside class="lg:m-0 mb-4 xl:w-1/4 lg:w-1/3 w-full">
        <div class="bg-white p-4 shadow-md">
          <figure class="flex justify-center items-center h-24">
            <div class="h-20 w-20 bg-black rounded-full"></div>
          </figure>
          <h2 id="username" class="text-center text-xl text-gray-600">@{{ name }}</h2>
          <ul class="mt-4 p-4 grid gap-y-2 grid-cols-1">
            <li class="text-xl flex items-center">
              <RouterLink to="/"><ion-icon name="document-text-outline" class="mr-2"></ion-icon>Articles</RouterLink>
            </li>
            <li class="text-xl flex items-center">
              <RouterLink to="/"><ion-icon name="archive-outline" class="mr-2"></ion-icon>Archives</RouterLink>
            </li>
            <li class="text-xl flex items-center">
              <RouterLink to="/"><ion-icon name="thumbs-up-outline" class="mr-2"></ion-icon>Likes</RouterLink>
            </li>
            <li class="text-xl flex items-center">
              <RouterLink to="/"><ion-icon name="person-outline" class="mr-2"></ion-icon>Followers</RouterLink>
            </li>
          </ul>
        </div>
      </aside>
      <div class="lg:ml-4 xl:w-3/4 lg:w-2/3 w-full">
        <ul class="grid sm:gap-y-4 grid-cols-1">
          <div
            v-for="article in pageData"
            :key="article.id"
            class="article h-32 bg-white p-4 cursor-pointer sm:shadow-md sm:hover:shadow-xl transition-shadow"
            @click="() => push(article.id)"
          >
            <div class="relative h-full">
              <h2>{{ article.title }}</h2>
              <ul v-if="article.tags.length > 0" class="absolute bottom-0 left-0 flex flex-row">
                <li
                  v-for="tag in article.tags"
                  :key="tag.name"
                  class="inline-block p-2 mr-1 text-sm text-gray-900 border border-gray-200 hover:border-gray-600 transition-colors"
                  @click.stop
                >
                  <RouterLink :to="`/tag/${tag.name}`">{{ tag.name }}</RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </ul>
        <Pagination v-if="pagination && pageData.length > 0" :pagination="pagination" :to="`/user/${name}`" />
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "../components/Spinner.vue";
import Pagination from "../components/Pagination.vue";
export default {
  components: {
    Spinner,
    Pagination,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      pageData: null,
      userId: null,
      pagination: null,
      loading: false,
    };
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        await this.fetchPageData();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchPageData() {
      const payload = { name: this.name, page: this.page };
      const data = await this.$store.dispatch("post/getUserPage", payload);
      if (!data) return;
      this.pageData = data.data;
      delete data.data;
      this.userId = data.user_id;
      delete data.user_id;
      this.pagination = data;
    },
    push(id) {
      this.$router.push(`/article/${id}`);
    },
  },
};
</script>
