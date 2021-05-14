<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div v-if="!loading" id="article-detail" class="relative">
      <div v-if="article" class="lg:hidden sticky z-50 top-0 bg-white border-b border-blue-100 shadow">
        <div class="container flex justify-between items-center mx-auto sm:px-8 px-5">
          <div class="py-4">
            <Icon :icon="article.author" :to="`/user/${article.author.name}`" />
          </div>
          <div class="flex justify-between items-center rounded-2xl bg-gray-200 bg-opacity-80">
            <span class="pr-2 pl-3 likes-count">{{ article.likes_count }}</span>
            <LikeButton :is-liked="article.liked_by_me" @like="onChangeLike" />
          </div>
        </div>
      </div>
      <div class="container mx-auto flex flex-col lg:px-32 sm:p-8 sm:pb-16 pagetop-offset">
        <div class="title-area m-8 text-center">
          <h1 v-if="article" class="text-2xl">{{ article.title }}</h1>
        </div>
        <div class="flex relative">
          <div class="left-column absolute lg:block hidden -left-16 top-2 h-full w-12">
            <ul class="sticky top-40 flex flex-col">
              <li class="mx-auto">
                <LikeButton :is-liked="article.liked_by_me" size="lg" @like="onChangeLike" />
              </li>
              <li class="likes-count mx-auto text-xs text-gray-500">{{ article.likes_count }}</li>
            </ul>
          </div>
          <article class="min-main-height sm:shadow-md sm:p-10 p-5 pb-8 sm:rounded-lg bg-white lg:w-2/3 w-full">
            <MarkdownPreview v-if="article" :text="article.content" />
          </article>
          <aside v-if="article" class="lg:flex ml-6 hidden w-1/3 flex-col">
            <div class="bg-white shadow-md w-full p-4 mb-8 rounded-lg">
              <IconList :icons="article.tags" to="/tag" />
            </div>
            <div class="w-full sticky top-8">
              <div class="shadow-md bg-white p-4 mb-8 rounded-lg">
                <Icon :icon="article.author" :to="`/user/${article.author.name}`" />
              </div>
              <div class="index shadow-md bg-white p-4 rounded-lg h-20"></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownPreview from "../components/MarkdownPreview.vue";
import Icon from "../components/Icon.vue";
import IconList from "../components/IconList.vue";
import Spinner from "../components/Spinner.vue";
import LikeButton from "../components/LikeButton.vue";

export default {
  components: {
    MarkdownPreview,
    Icon,
    IconList,
    Spinner,
    LikeButton,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      article: null,
      loading: false,
    };
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        await this.fetchArticle();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchArticle() {
      const article = await this.$store.dispatch("post/getArticle", this.id);
      if (!article) return;
      this.article = article;
    },
    async onChangeLike(e) {
      if (e.isLiked) {
        this.like();
        if (!(await this.$store.dispatch("post/putLike", this.article.id))) {
          this.unlike();
        }
      } else {
        this.unlike();
        if (!(await this.$store.dispatch("post/deleteLike", this.article.id))) {
          this.like();
        }
      }
    },
    like() {
      this.article.likes_count += 1;
      this.article.liked_by_me = true;
    },
    unlike() {
      this.article.likes_count -= 1;
      this.article.liked_by_me = false;
    },
  },
};
</script>
