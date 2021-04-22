<template>
  <ul class="grid gap-y-2" :class="{ 'grid-cols-2 gap-x-2': direction === 'row' }">
    <li v-for="icon in icons" :key="icon.name">
      <Icon :icon="icon" :size="size" :to="`${to}/${icon.name}`" />
    </li>
  </ul>
</template>

<script>
import Icon from "../components/Icon.vue";
export default {
  components: {
    Icon,
  },
  props: {
    icons: {
      type: Array,
      required: true,
    },
    direction: {
      type: String,
      required: false,
      default: "col",
      validator(value) {
        return ["row", "col"].indexOf(value) !== -1;
      },
    },
    size: {
      type: String,
      required: false,
      default: "md",
      validator(value) {
        return ["sm", "md", "lg"].indexOf(value) !== -1;
      },
    },
    to: {
      type: String,
      required: false,
      default: "",
    },
  },
};
</script>
