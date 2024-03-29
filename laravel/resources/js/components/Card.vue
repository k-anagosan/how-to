<template>
  <li class="shadow-md hover:shadow-xl transition-shadow">
    <div class="card cursor-pointer" @click="push">
      <figure class="relative article-card-image">
        <img alt="" />
        <div class="absolute right-2 bottom-2 z-50 flex justify-between items-center">
          <ArchiveButton :is-archived="article.archived_by_me" @archive="onChangeArchive" />
          <div class="flex items-center rounded-2xl bg-gray-50 bg-opacity-80 ml-1">
            <span class="pr-2 pl-3 likes-count">{{ article.likes_count }}</span>
            <LikeButton :is-liked="article.liked_by_me" @like="onChangeLike" />
          </div>
        </div>
      </figure>
      <div class="flex flex-col bg-white p-6 min-card-height">
        <div class="flex h-6 mb-2 justify-between">
          <div @click.stop>
            <Icon :icon="article.author" size="sm" :to="`/user/${article.author.name}`" />
          </div>
          <div v-if="ownedByMe" class="relative flex items-center">
            <EditMenu :article-id="article.id" @delete="deleteCard" />
          </div>
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
import ArchiveButton from "../components/ArchiveButton";
import EditMenu from "../components/EditMenu";

export default {
  components: {
    Icon,
    LikeButton,
    EditMenu,
    ArchiveButton,
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
  methods: {
    async onChangeLike(e) {
      const action = e.isLiked ? "post/putLike" : "post/deleteLike";
      this.$emit("changeLike", { id: this.article.id, isLiked: e.isLiked });
      if (!(await this.$store.dispatch(action, this.article.id))) {
        this.$emit("changeLike", { id: this.article.id, isLiked: !e.isLiked });
      }
    },
    async onChangeArchive(e) {
      const action = e.isArchived ? "post/putArchive" : "post/deleteArchive";
      this.$emit("changeArchive", { id: this.article.id, isArchived: e.isArchived });
      if (!(await this.$store.dispatch(action, this.article.id))) {
        this.$emit("changeArchive", { id: this.article.id, isArchived: !e.isArchived });
      }
    },
    push(e) {
      if (this.ownedByMe && this.$el.querySelector(`#open-button-${this.article.id}`).contains(e.target)) return;
      this.$router.push(`/article/${this.article.id}`);
    },
    deleteCard() {
      this.$store.commit("userpage/setArticles", null, { root: true });
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
