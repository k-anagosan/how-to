<template>
  <div class="flex justify-start items-center">
    <div
      class="icon rounded-full bg-black mr-2"
      :class="`icon-size-${size}`"
    ></div>
    <span> {{ icon.name }}</span>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: "md",
      validator(value) {
        return ["sm", "md", "lg"].indexOf(value) !== -1;
      },
    },
  },
};
</script>
