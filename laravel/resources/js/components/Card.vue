<template>
  <li class="shadow-md">
    <div class="card cursor-pointer" @click="push">
      <figure class="relative article-card-image">
        <img alt="" />
        <div
          class="absolute right-2 bottom-2 z-50 flex justify-between items-center rounded-2xl bg-gray-50 bg-opacity-80"
        >
          <span class="pr-2 pl-3 likes-count">{{ article.likes_count }}</span>
          <LikeButton :is-liked="article.liked_by_me" @like="onChangeLike" />
        </div>
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
            @click.stop
          >
            <RouterLink to="/" class="tag">
              {{ tag.name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script>
import Icon from "../components/Icon";
import LikeButton from "../components/LikeButton";

export default {
  components: {
    Icon,
    LikeButton,
  },
  props: {
    article: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async onChangeLike(e) {
      if (e.isLiked) {
        const id = await this.$store.dispatch("post/putLike", this.article.id);
        this.$emit("changeLike", { id, isLiked: true });
      } else {
        const id = await this.$store.dispatch("post/deleteLike", this.article.id);
        this.$emit("changeLike", { id, isLiked: false });
      }
    },
    push() {
      this.$router.push(`/article/${this.article.id}`);
    },
  },
};
</script>
