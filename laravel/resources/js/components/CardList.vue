<template>
  <div>
    <slot></slot>
    <ul v-if="list" class="cardlist grid" :class="grid">
      <Card v-for="article in list" :key="article.id" :article="article" @changeLike="onChangeLike" />
    </ul>
  </div>
</template>

<script>
import Card from "../components/Card.vue";
export default {
  components: {
    Card,
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
    grid: {
      type: String,
      required: false,
      default: "lg:grid-cols-3 md:grid-cols-2 sm:gap-4 gap-y-6",
    },
  },
  methods: {
    onChangeLike({ id, isLiked }) {
      this.$emit("changeLike", { id, isLiked });
    },
  },
};
</script>
