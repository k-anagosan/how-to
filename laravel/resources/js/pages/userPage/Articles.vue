<template>
  <div>
    <Spinner v-if="loading" />
    <div v-if="!loading" id="articles">
      <div v-if="pageData !== null && pageData.length > 0" class="grid sm:gap-y-4 grid-cols-1">
        <CardList class="sm:mx-0 mx-4" :list="pageData" @changeLike="onChangeLike" />
        <Pagination
          v-if="!loading && pagination && pageData.length > 0"
          class="sm:mx-0 mx-4"
          :pagination="pagination"
          :to="`/user/${username}`"
        />
      </div>
      <div v-if="pageData === null || pageData.length === 0" class="sm:mx-0 mx-4">
        <h1>まだ記事を投稿していません</h1>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "../../components/Spinner.vue";
import Pagination from "../../components/Pagination.vue";
import CardList from "../../components/CardList.vue";
import { mapState } from "vuex";
export default {
  components: {
    Spinner,
    Pagination,
    CardList,
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
      articles: state => state.userpage.articles,
    }),
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        await this.fetchPageData();
        this.setData();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchPageData() {
      if (!this.articles || this.articles.current_page !== this.page) {
        const payload = { name: this.username, page: this.page };
        await this.$store.dispatch("userpage/getArticles", payload);
      }
    },
    setData() {
      const articles = { ...this.articles };
      this.pageData = articles.data;
      delete articles.data;
      this.pagination = articles;
    },
    onChangeLike({ id, isLiked }) {
      this.pageData = this.pageData.map(article => {
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
  },
};
</script>
