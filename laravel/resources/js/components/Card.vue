<template>
  <li class="shadow-md">
    <RouterLink :to="`/article/${article.id}`" class="card">
      <figure class="article-card-image">
        <img alt="" />
      </figure>
      <div class="flex flex-col bg-white sm:p-6 p-4 min-card-height">
        <Icon :icon="article.author" size="sm" class="mb-2" />
        <h2 class="article-title mb-4 flex-auto font-bold">
          {{ article.title }}
        </h2>
        <ul v-if="article.tags" class="flex flex-wrap">
          <li
            v-for="tag in article.tags"
            :key="tag.name"
            class="article-tag inline-block px-1 mr-1 mb-1 border text-sm"
          >
            <RouterLink to="/" class="tag">
              {{ tag.name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </RouterLink>
  </li>
</template>

<script>
import Icon from "../components/Icon";
export default {
  components: {
    Icon,
  },
  props: {
    article: {
      type: Object,
      required: true,
    },
  },
};
</script>
