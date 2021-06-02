<template>
  <div>
    <Spinner v-if="loading" />
    <div v-if="!loading" id="archives">
      <div v-if="pageData !== null && pageData.length > 0" class="grid sm:gap-y-4 grid-cols-1">
        <CardList
          class="sm:mx-0 mx-4"
          :list="pageData"
          grid="xl:grid-cols-3 lg:grid-cols-2 sm:gap-4 gap-y-6"
          @changeLike="onChangeLike"
          @changeArchive="onChangeArchive"
        />
        <Pagination
          v-if="!loading && pagination && pageData.length > 0"
          class="sm:mx-0 mx-4"
          :pagination="pagination"
          :to="`/user/${username}/archives`"
        />
      </div>
      <div v-if="pageData === null || pageData.length === 0" class="sm:mx-0 mx-4">
        <h1>まだ記事をアーカイブしていません</h1>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "../../components/Spinner.vue";
import Pagination from "../../components/Pagination.vue";
import CardList from "../../components/CardList.vue";
import { mapState, mapGetters } from "vuex";
export default {
  components: {
    Spinner,
    Pagination,
    CardList,
  },
  beforeRouteLeave(to, from, next) {
    if (this.username === this.loginUsername && this.isChanged) {
      this.$store.commit("userpage/setArticles", null, { root: true });
      this.$store.commit("userpage/setArchives", null, { root: true });
    }
    next();
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
      isChanged: false,
    };
  },
  computed: {
    ...mapState({
      articles: state => state.userpage.archives,
    }),
    ...mapGetters({
      loginUsername: "auth/username",
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
    articles: {
      async handler() {
        if (!this.articles) {
          await this.fetchPageData(this.page);
        }
        this.setData();
      },
    },
  },
  methods: {
    async fetchPageData() {
      const payload = { name: this.username, page: this.page };
      await this.$store.dispatch("userpage/getArchivedArticles", payload);
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
      if (this.username === this.loginUsername) {
        this.$store.commit("userpage/setLikes", null, { root: true });
      }
    },
    onChangeArchive({ id, isArchived }) {
      this.pageData = this.pageData.map(article => {
        if (article.id === id) {
          article.archived_by_me = isArchived;
        }
        return article;
      });
      this.isChanged = true;
    },
  },
};
</script>
