<template>
  <div class="relative pagetop-offset flex flex-col lg:px-16 sm:pb-8">
    <div
      class="lg:hidden flex justify-between items-center sticky z-50 top-0 sm:px-8 px-4 sm:-mx-8 mx-0 bg-white border-b border-blue-50"
    >
      <div class="py-4 flex justify-between items-center">
        <div class="rounded-full bg-black h-8 w-8 mr-2"></div>
        <span v-if="article"> {{ article.author.name }}</span>
      </div>
      <button
        type="button"
        class="rounded-full bg-gray-100 flex justify-center items-center p-2 outline-none"
      >
        <ion-icon name="heart-outline"></ion-icon>
      </button>
    </div>
    <div v-if="article" class="title-area p-8 text-center">
      <h1 class="text-2xl">{{ article.title }}</h1>
    </div>

    <div class="flex">
      <article
        v-if="article"
        class="sm:shadow-md sm:p-10 p-4 pb-8 sm:rounded-lg bg-white lg:w-2/3 w-full"
      >
        <div class="md-preview-area" v-html="formattedContent"></div>
      </article>
      <aside v-if="article" class="lg:flex ml-6 hidden w-1/3 flex-col">
        <ul class="tags shadow-md bg-white w-full p-4 mb-8 rounded-lg">
          <li>tag1</li>
          <li>tag1</li>
          <li>tag1</li>
        </ul>
        <div class="w-full sticky top-8">
          <div
            class="author shadow-md bg-white p-4 flex justify-start items-center mb-8 rounded-lg"
          >
            <div class="rounded-full bg-black h-8 w-8 mr-2"></div>
            <span v-if="article"> {{ article.author.name }}</span>
          </div>
          <div class="index shadow-md bg-white p-4 rounded-lg h-20"></div>
        </div>
      </aside>
    </div>
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
