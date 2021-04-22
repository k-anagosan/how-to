<template>
  <div class="xl:mx-40 mx-4">
    <slot></slot>
    <ul v-if="list" class="cardlist grid lg:grid-rows-6 lg:grid-cols-3 sm:grid-rows-9 sm:grid-cols-2 sm:gap-6 gap-y-6">
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
  },
  methods: {
    onChangeLike({ id, isLiked }) {
      this.$emit("changeLike", { id, isLiked });
    },
  },
};
</script>
