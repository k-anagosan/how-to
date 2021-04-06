<template>
  <div class="header-offset">
    <h1 v-if="article">{{ article.title }}</h1>
    <div v-if="article" class="md-preview-area" v-html="formattedContent"></div>
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
