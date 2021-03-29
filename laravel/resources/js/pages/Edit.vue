<template>
  <div class="edit sm:-mx-8 h-full">
    <form id="edit" class="flex flex-col h-full" @submit.prevent="post">
      <input
        v-model="postForm.title"
        type="text"
        name="title"
        class="block w-full border px-2 py-1"
        placeholder="タイトル"
      />
      <input
        v-model="postForm.tags"
        type="text"
        name="tags"
        class="block w-full border px-2"
        placeholder="タグ"
      />
      <ul class="flex justify-start items-center h-8 mt-1">
        <li class="h-full mr-2 relative">
          <button
            id="write-tab"
            :class="{ 'text-gray-900 font-bold': tab === 1 }"
            class="flex justify-center items-center h-full px-4 text-gray-500 outline-none focus:outline-none"
            type="button"
            @click="tab = 1"
          >
            Write
          </button>
          <span
            class="absolute bottom-0 h-0.5 w-full bg-gray-300"
            :class="{ 'bg-gray-900': tab === 1 }"
          ></span>
        </li>
        <li class="h-full mr-2 relative">
          <button
            id="preview-tab"
            :class="{ 'text-gray-900 font-bold': tab === 2 }"
            class="flex justify-center items-center h-full px-4 text-gray-500 outline-none focus:outline-none"
            type="button"
            @click="tab = 2"
          >
            Preview
          </button>
          <span
            class="absolute bottom-0 h-0.5 w-full bg-gray-300"
            :class="{ 'bg-gray-900': tab === 2 }"
          ></span>
        </li>
      </ul>
      <div class="content flex-auto">
        <div v-show="tab === 1" class="edit-content w-full h-full">
          <textarea
            v-model="postForm.content"
            name="content"
            class="block w-full border-2 resize-none p-2 h-full overflow-scroll"
            placeholder="共有したい知識をMarkdown記法で書いて投稿しましょう"
          ></textarea>
        </div>
        <div v-show="tab === 2" class="preview-content w-full h-full">
          <div
            class="preview p-2 border h-full overflow-scroll break-words"
            v-html="htmlContent"
          ></div>
        </div>
      </div>
      <div class="flex justify-between my-2">
        <input
          id="post-photo"
          type="file"
          name="photo"
          class="hidden"
          value="Add Photo"
          @change="onFileChange"
        />
        <label
          for="post-photo"
          class="bg-gray-700 text-white py-1 px-4 rounded-sm focus:bg-white focus:text-gray-700 transition-colors"
          >Add Photo</label
        >
        <Button id="post-btn" type="submit">Post</Button>
      </div>
    </form>
  </div>
</template>
<script>
import Button from "../components/SubmitButton.vue";

export default {
  components: {
    Button,
  },
  data() {
    return {
      postForm: {
        title: "",
        tags: [],
        content: "",
      },
      htmlContent: "",
      tab: 1,
    };
  },
  watch: {
    "postForm.content"(val) {
      this.htmlContent = this.sanitize(val);
    },
    "postForm.title"(val) {
      this.postForm.title = this.sanitize(val);
    },
  },
  methods: {
    post() {
      console.log(this.postForm);
    },
    sanitize(val) {
      const sanitizedContent = this.$dompurify.sanitize(val);
      return this.$marked(sanitizedContent);
    },
    onFileChange(event) {
      console.log(event.target.files[0]);
    },
  },
};
</script>
