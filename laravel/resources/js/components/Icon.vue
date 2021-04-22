<template>
  <div id="id-wrapper" class="inline-block cursor-pointer" @click="onClick">
    <div class="flex justify-start items-center">
      <div class="icon inline-block rounded-full bg-black mr-2" :class="`icon-size-${size}`"></div>
      <span> {{ icon.name }}</span>
    </div>
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
    to: {
      type: String,
      required: false,
      default: null,
    },
  },
  methods: {
    onClick() {
      if (this.to) this.$router.push(this.to);
    },
  },
};
</script>
