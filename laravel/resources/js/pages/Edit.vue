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
        v-model="tagsString"
        type="text"
        name="tags"
        class="block w-full border px-2"
        placeholder="タグ"
      />
      <ul class="flex sm:justify-start justify-between items-center h-8 mt-1">
        <li class="flex justify-start h-full">
          <ul class="flex justify-start h-full items-center">
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
        </li>
        <li class="h-full flex items-center">
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
            class="h-full flex items-center px-4 rounded-sm focus:bg-white focus:text-gray-700 transition-colors cursor-pointer"
            ><ion-icon name="image-outline"></ion-icon
          ></label>
        </li>
      </ul>
      <div class="content flex-auto">
        <div v-show="tab === 1" class="edit-content w-full h-full">
          <textarea
            v-model="postForm.content"
            name="content"
            class="block w-full border resize-none p-2 h-full overflow-scroll"
            placeholder="共有したい知識をMarkdown記法で書いて投稿しましょう"
          ></textarea>
        </div>
        <div v-show="tab === 2" class="preview-content w-full h-full">
          <div
            id="preview-area"
            class="p-2 border h-full overflow-scroll break-words"
            v-html="htmlContent"
          ></div>
        </div>
      </div>
      <div class="flex justify-end my-2">
        <Button id="post-btn" type="submit">Post</Button>
      </div>
    </form>
  </div>
</template>
<script>
import Button from "../components/SubmitButton.vue";
import { mapState } from "vuex";

export default {
  components: {
    Button,
  },
  data() {
    return {
      postForm: {
        title: "",
        content: "",
        tags: [],
      },
      htmlContent: "",
      tagsString: "",
      tab: 1,
    };
  },
  computed: {
    ...mapState({
      apiIsSuccess: state => state.post.apiIsSuccess,
      postErrors: state => state.post.postValidationMessage,
      photoErrors: state => state.post.photoValidationMessage,
    }),
  },
  watch: {
    "postForm.content"(val) {
      this.htmlContent = this.format(val);
    },
  },
  methods: {
    async post() {
      const tags = this.tagsString.split(" ");
      if (tags.length === 1 && tags[0] === "") {
        this.postForm.tags = null;
      } else {
        this.postForm.tags = tags;
      }
      const postId = await this.$store.dispatch("post/postItem", this.postForm);
      console.log(postId);
    },
    async onFileChange(event) {
      if (event.target.files.length === 0) {
        this.reset();
        return false;
      }

      const formData = new FormData();
      formData.append("photo", event.target.files[0]);

      const filename = await this.$store.dispatch("post/postPhoto", formData);

      this.reset();

      if (this.apiIsSuccess) {
        const image = `![${filename}](https://how-to.s3-ap-northeast-1.amazonaws.com/photos/${filename})\n`;
        this.postForm.content += image;
      }

      return true;
    },
    reset() {
      this.$el.querySelector("input[type='file']").value = null;
    },
    format(val) {
      const sanitizedContent = this.$dompurify.sanitize(val);
      return this.$marked(sanitizedContent);
    },
  },
};
</script>
