<template>
  <div class="relative">
    <div
      v-if="article"
      class="lg:hidden sticky z-50 top-0 bg-white border-b border-blue-100 shadow"
    >
      <div
        class="container flex justify-between items-center mx-auto sm:px-8 px-5"
      >
        <div class="py-4">
          <Icon :icon="article.author" />
        </div>
        <button
          type="button"
          class="rounded-full bg-gray-100 flex justify-center items-center h-8 w-8 outline-none"
        >
          <ion-icon name="heart-outline"></ion-icon>
        </button>
      </div>
    </div>
    <div
      class="container mx-auto flex flex-col lg:px-32 sm:p-8 sm:pb-16 pagetop-offset"
    >
      <div class="title-area sm:h-8 m-8 text-center">
        <h1 v-if="article" class="text-2xl">{{ article.title }}</h1>
      </div>
      <div class="flex">
        <article
          class="min-main-height sm:shadow-md sm:p-10 p-5 pb-8 sm:rounded-lg bg-white lg:w-2/3 w-full"
        >
          <MarkdownPreview v-if="article" :text="article.content" />
        </article>
        <aside v-if="article" class="lg:flex ml-6 hidden w-1/3 flex-col">
          <div class="bg-white shadow-md w-full p-4 mb-8 rounded-lg">
            <IconList :icons="article.tags" />
          </div>
          <div class="w-full sticky top-8">
            <div class="shadow-md bg-white p-4 mb-8 rounded-lg">
              <Icon :icon="article.author" />
            </div>
            <div class="index shadow-md bg-white p-4 rounded-lg h-20"></div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownPreview from "../components/MarkdownPreview.vue";
import Icon from "../components/Icon.vue";
import IconList from "../components/IconList.vue";

export default {
  components: {
    MarkdownPreview,
    Icon,
    IconList,
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
    };
  },
  watch: {
    $route: {
      async handler() {
        await this.fetchArticle();
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
  },
};
</script>
