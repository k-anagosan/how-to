<template>
  <div v-if="errors">
    <ul v-if="errors[element]">
      <li v-for="msg in errors[element]" :key="msg">{{ msg }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    errors: {
      type: Object,
      required: false,
      default() {
        return null;
      },
    },
    element: {
      type: String,
      required: true,
    },
  },
};
</script>
