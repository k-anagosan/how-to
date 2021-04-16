<template>
  <div class="md-preview-area" v-html="formattedContent"></div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  computed: {
    formattedContent() {
      return this.format(this.text);
    },
  },
  methods: {
    format(val) {
      const sanitizedContent = this.$dompurify.sanitize(val);
      return this.$marked(sanitizedContent);
    },
  },
};
</script>
