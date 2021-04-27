<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div v-if="!loading" id="cardlist" class="pagetop-offset">
      <CardList :list="list" @changeLike="onChangeLike" />
      <Pagination v-if="pagination" class="xl:mx-40 mx-4" :pagination="pagination" to="/" />
    </div>
  </div>
</template>
<script>
import CardList from "../components/CardList.vue";
import Pagination from "../components/Pagination.vue";
import Spinner from "../components/Spinner.vue";

export default {
  components: {
    CardList,
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
      const payload = { page: this.page };
      const response = await this.$store.dispatch("post/getArticleList", payload);
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
