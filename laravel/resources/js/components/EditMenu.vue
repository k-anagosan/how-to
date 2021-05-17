<template>
  <div class="edit-menu-wrapper flex items-center">
    <ion-icon
      :id="`open-button-${articleId}`"
      name="chevron-down-outline"
      class="text-2xl text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
      @click="isShown = !isShown"
    ></ion-icon>
    <div
      v-if="isShown"
      class="absolute edit-menu flex flex-col rounded-lg shadow-lg top-6 bg-white cursor-pointer"
      :class="direction === 'right' ? 'left-1/2' : '-left-20'"
      @click.stop
    >
      <RouterLink to="/" class="p-2 w-24 rounded-t-lg border-b border-gray-200 hover:bg-blue-100 transition-colors"
        >更新する</RouterLink
      >
      <div
        class="delete-button p-2 w-24 rounded-b-lg text-red-500 hover:bg-blue-100 transition-colors"
        @click="onClick"
      >
        削除する
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    direction: {
      type: String,
      required: false,
      default: "left",
      validator(value) {
        return ["left", "right"].indexOf(value) !== -1;
      },
    },
    articleId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isShown: false,
    };
  },
  mounted() {
    window.addEventListener("click", this.closeMenu);
    window.addEventListener("keydown", this.onKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.closeMenu);
    window.removeEventListener("keydown", this.onKeyDown);
  },
  methods: {
    onClick() {
      this.deleteArticle();
    },
    onKeyDown(e) {
      if (e.key === "Escape") this.isShown = false;
    },
    closeMenu(e) {
      if (!this.$el.querySelector(`#open-button-${this.articleId}`).contains(e.target)) {
        this.isShown = false;
      }
    },
    async deleteArticle() {
      const deletedItem = await this.$store.dispatch("post/deleteItem", this.articleId);
      if (deletedItem) this.$emit("delete");
    },
  },
};
</script>
