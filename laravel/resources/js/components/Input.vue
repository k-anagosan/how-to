<template>
  <div class="mb-4">
    <label :for="id" class="inline-block mb-1">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="val"
      class="block w-full relative border-0 border-b-2 border-gray-300 text-lg focus:outline-none focus:border-gray-500 transition"
      @input="onInput"
    />
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: false,
      default: "text",
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      val: this.value,
    };
  },
  methods: {
    onInput($e) {
      this.val = $e.target.value;
      this.$emit("input", this.val);
    },
  },
};
</script>

<style></style>
