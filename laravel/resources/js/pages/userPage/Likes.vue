<template>
  <div>
    <Spinner v-if="loading" />
    <div v-if="!loading" id="likes">
      <div v-if="pageData !== null && pageData.length > 0" class="grid sm:gap-y-4 grid-cols-1">
        <div
          v-for="article in pageData"
          :key="article.id"
          class="h-32 bg-white p-4 cursor-pointer sm:shadow-md sm:hover:shadow-xl transition-shadow"
          @click="() => push(article.id)"
        >
          <div class="article relative h-full">
            <p>{{ article.author.name }}</p>
            <h2>{{ article.title }}</h2>
            <ul v-if="article.tags.length > 0" class="absolute bottom-0 left-0 flex flex-row">
              <li v-for="tag in article.tags" :key="tag.name" class="inline-block" @click.stop>
                <RouterLink :to="`/tag/${tag.name}`">
                  <div
                    class="tag p-2 mr-1 text-xs text-gray-900 border border-gray-200 hover:border-gray-600 transition-colors"
                  >
                    {{ tag.name }}
                  </div>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
        <Pagination
          v-if="!loading && pagination && pageData.length > 0"
          class="sm:mx-0 mx-2"
          :pagination="pagination"
          :to="`/user/${username}/likes`"
        />
      </div>
      <div v-if="pageData === null || pageData.length === 0">
        <h1>まだ記事をいいねしていません</h1>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "../../components/Spinner.vue";
import Pagination from "../../components/Pagination.vue";
import { mapState } from "vuex";
export default {
  components: {
    Spinner,
    Pagination,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      pagination: null,
      pageData: null,
    };
  },
  computed: {
    ...mapState({
      articles: state => state.userpage.likes,
    }),
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        if (!this.articles || this.articles.current_page !== this.page) {
          await this.fetchPageData();
        }
        this.setData();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    push(id) {
      this.$router.push(`/article/${id}`);
    },
    async fetchPageData() {
      const payload = { name: this.username, page: this.page };
      await this.$store.dispatch("userpage/getLikedArticles", payload);
    },
    setData() {
      const articles = { ...this.articles };
      this.pageData = articles.data;
      delete articles.data;
      this.pagination = articles;
    },
  },
};
</script>
