<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div v-if="!loading" id="cardlist" class="pagetop-offset">
      <div class="xl:mx-40 mx-4">
        <h1 class="text-4xl mb-4">{{ tag }}</h1>
        <ul
          v-if="list"
          class="cardlist grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6"
        >
          <Card v-for="article in list" :key="article.id" :article="article" @changeLike="onChangeLike" />
        </ul>
      </div>
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
    tag: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      list: null,
      pagination: null,
      loading: false,
    };
  },
  computed: {
    isAuth() {
      return this.$store.getters["auth/isAuthenticated"];
    },
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
    isAuth(isAuth) {
      if (!isAuth) this.clearLike();
    },
  },
  methods: {
    async fetchArticleList() {
      const data = { page: this.page, tag: this.tag };
      const response = await this.$store.dispatch("post/getArticleList", data);
      if (!response) return;
      this.list = response.data;
      delete response.data;
      this.pagination = response;
    },
    onChangeLike({ id, isLiked }) {
      this.list = this.list.map(article => {
        if (article.id === id) {
          if (isLiked) {
            article.likes_count += 1;
            article.liked_by_me = true;
          } else {
            article.likes_count -= 1;
            article.liked_by_me = false;
          }
        }
        return article;
      });
    },
    clearLike() {
      this.list = this.list.map(article => {
        article.liked_by_me = false;
        return article;
      });
    },
  },
};
</script>
