<template>
  <div>
    <div class="md-preview-area" v-html="formattedContent"></div>
  </div>
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
      const config = {
        FORBID_TAGS: ["button", "form", "input", "style"],
        KEEP_CONTENT: true,
      };
      return this.$dompurify.sanitize(this.$marked(val), config);
    },
  },
};
</script>
