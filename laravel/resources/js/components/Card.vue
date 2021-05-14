<template>
  <li class="shadow-md hover:shadow-xl transition-shadow">
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
      <div class="flex flex-col bg-white p-6 min-card-height">
        <div class="flex justify-between">
          <span @click.stop>
            <Icon :icon="article.author" size="sm" class="mb-2" :to="`/user/${article.author.name}`" />
          </span>
          <span v-if="ownedByMe" class="relative mb-2 flex items-center">
            <ion-icon
              :id="`open-button-${article.id}`"
              name="chevron-down-outline"
              class="text-2xl text-gray-400 hover:text-gray-800 transition-colors"
              @click="isShown = !isShown"
            ></ion-icon>
            <div
              v-if="isShown"
              class="absolute edit-menu flex flex-col rounded-lg shadow-lg top-6 -left-20 bg-white"
              @click.stop
            >
              <RouterLink
                to="/"
                class="p-2 w-24 rounded-t-lg border-b border-gray-200 hover:bg-blue-100 transition-colors"
                >更新する</RouterLink
              >
              <div class="p-2 w-24 rounded-b-lg text-red-500 hover:bg-blue-100 transition-colors" @click="onClick">
                削除する
              </div>
            </div>
          </span>
        </div>
        <h2 class="article-title mb-4 flex-auto font-bold">
          {{ article.title }}
        </h2>
        <ul v-if="article.tags" class="flex flex-wrap">
          <li v-for="tag in article.tags" :key="tag.name" class="article-tag" @click.stop>
            <RouterLink
              :to="`/tag/${tag.name}`"
              class="inline-block mr-1 mb-1 tag border border-gray-200 hover:border-gray-600 transition-colors"
              active-class="active-tag"
            >
              <div class="inline-block lg:p-2 p-1 text-xs text-gray-900 transition-colors">
                {{ tag.name }}
              </div>
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
    ownedByMe: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isShown: false,
    };
  },
  mounted() {
    window.addEventListener("click", this.closeMenu);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.closeMenu);
  },
  methods: {
    async onChangeLike(e) {
      if (e.isLiked) {
        this.$emit("changeLike", { id: this.article.id, isLiked: true });
        if (!(await this.$store.dispatch("post/putLike", this.article.id)))
          this.$emit("changeLike", { id: this.article.id, isLiked: false });
      } else {
        this.$emit("changeLike", { id: this.article.id, isLiked: false });
        if (!(await this.$store.dispatch("post/deleteLike", this.article.id)))
          this.$emit("changeLike", { id: this.article.id, isLiked: true });
      }
    },
    push(e) {
      if (this.ownedByMe && this.$el.querySelector(`#open-button-${this.article.id}`).contains(e.target)) return;
      this.$router.push(`/article/${this.article.id}`);
    },
    onClick() {},
    closeMenu(e) {
      if (this.ownedByMe && !this.$el.querySelector(`#open-button-${this.article.id}`).contains(e.target)) {
        this.isShown = false;
      }
    },
  },
};
</script>
<style>
.active-tag {
  border-color: rgba(75, 85, 99, 1);
}
.edit-menu {
  box-shadow: 0 3px 12px rgb(0 61 111 / 25%);
}
</style>
