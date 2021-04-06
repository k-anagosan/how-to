<template>
  <div class="header-offset flex lg:px-16 sm:pb-8">
    <article
      v-if="article"
      class="sm:shadow-md sm:p-10 p-4 pb-8 sm:rounded-lg bg-white lg:w-2/3 w-full"
    >
      <div class="title-area">
        <h1 class="text-2xl">{{ article.title }}</h1>
      </div>
      <div class="md-preview-area" v-html="formattedContent"></div>
    </article>
    <aside v-if="article" class="lg:flex ml-6 hidden w-1/3 flex-col">
      <ul class="tags shadow-md bg-white w-full p-4 mb-8 rounded-lg">
        <li>tag1</li>
        <li>tag1</li>
        <li>tag1</li>
      </ul>
      <div class="author shadow-md bg-white w-full p-4 rounded-lg">
        {{ article.author.name }}
      </div>
    </aside>
  </div>
</template>

<script>
import { OK } from "../utils";
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      article: null,
      formattedContent: "",
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
      const response = await window.axios.get(`/api/post/${this.id}`);

      if (response.status !== OK) {
        this.$store.commit("error/setCode", response.status);
        return;
      }
      this.article = response.data;
      this.formattedContent = this.format(response.data.content);
    },
    format(val) {
      const sanitizedContent = this.$dompurify.sanitize(val);
      return this.$marked(sanitizedContent);
    },
  },
};
</script>
