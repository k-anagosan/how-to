<template>
  <div class="edit">
    <form id="edit" @submit.prevent="post">
      <Spinner v-if="loading" class="pagetop-offset" />
      <div v-if="!loading" id="edit-form">
        <div class="flex flex-col main-height pagetop-offset">
          <input
            v-model="postForm.title"
            type="text"
            name="title"
            class="block w-full border px-2 py-1"
            placeholder="タイトル"
          />
          <input v-model="tagsString" type="text" name="tags" class="block w-full border px-2" placeholder="タグ" />
          <ul class="flex sm:justify-start justify-between items-center ml-2 mt-1">
            <li class="flex justify-start h-full">
              <ul class="flex justify-start h-full items-center">
                <li class="h-full mr-2 relative">
                  <button
                    id="write-tab"
                    :class="{ 'text-gray-900 font-bold': tab === 1 }"
                    class="flex justify-center items-center h-8 px-4 text-gray-500 outline-none focus:outline-none"
                    type="button"
                    @click="tab = 1"
                  >
                    Write
                  </button>
                  <span class="absolute bottom-0 h-0.5 w-full bg-gray-300" :class="{ 'bg-gray-900': tab === 1 }"></span>
                </li>
                <li class="h-full mr-2 relative">
                  <button
                    id="preview-tab"
                    :class="{ 'text-gray-900 font-bold': tab === 2 }"
                    class="flex justify-center items-center h-8 px-4 text-gray-500 outline-none focus:outline-none"
                    type="button"
                    @click="tab = 2"
                  >
                    Preview
                  </button>
                  <span class="absolute bottom-0 h-0.5 w-full bg-gray-300" :class="{ 'bg-gray-900': tab === 2 }"></span>
                </li>
              </ul>
            </li>
            <li class="h-full flex items-center">
              <input id="post-photo" type="file" name="photo" class="hidden" value="Add Photo" @change="onFileChange" />
              <label
                for="post-photo"
                class="h-full flex items-center px-4 rounded-sm focus:bg-white focus:text-gray-700 transition-colors cursor-pointer"
                ><ion-icon name="image-outline"></ion-icon
              ></label>
            </li>
          </ul>
          <div class="content flex-auto overflow-auto border shadow sm:rounded bg-white">
            <div v-show="tab === 1" class="edit-content flex flex-col w-full h-full">
              <textarea
                v-model="postForm.content"
                name="content"
                class="block w-full resize-none p-4 flex-auto"
                placeholder="共有したい知識をMarkdown記法で書いて投稿しましょう"
              ></textarea>
            </div>
            <div v-show="tab === 2" class="preview-content flex flex-col w-full h-full">
              <MarkdownPreview :text="postForm.content" class="flex-auto sm:p-10 p-4 break-words" />
            </div>
          </div>
        </div>
        <div class="flex justify-end my-2 sm:mr-0 mr-2">
          <Button id="post-btn" type="submit">Post</Button>
        </div>
      </div>
    </form>
    <ErrorMessages :errors="errors" @clear="clearMessage" />
  </div>
</template>
<script>
import Button from "../components/SubmitButton.vue";
import MarkdownPreview from "../components/MarkdownPreview.vue";
import ErrorMessages from "../components/ErrorMessages.vue";
import Spinner from "../components/Spinner.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    Button,
    MarkdownPreview,
    ErrorMessages,
    Spinner,
  },
  data() {
    return {
      postForm: {
        title: "",
        content: "",
        tags: [],
      },
      tagsString: "",
      tab: 1,
      loading: false,
    };
  },
  computed: {
    ...mapState({
      apiIsSuccess: state => state.post.apiIsSuccess,
    }),
    ...mapGetters({
      errors: "post/allErrors",
    }),
  },
  watch: {
    tagsString(val) {
      const tags = val.split(" ");
      if (tags.length === 1 && tags[0] === "") {
        this.postForm.tags = null;
      } else {
        this.postForm.tags = tags;
      }
    },
  },
  methods: {
    async post() {
      this.loading = true;
      const postId = await this.$store.dispatch("post/postItem", this.postForm);
      this.loading = false;
      if (postId !== null) {
        this.clearMessage();
        this.$router.push(`article/${postId}`);
      }
      setTimeout(this.clearMessage, 5000);
    },
    async onFileChange(event) {
      const file = this.takeFile(event);
      if (file === null) {
        this.reset();
        return false;
      }

      const formData = new FormData();
      formData.append("photo", file);

      const filename = await this.$store.dispatch("post/postPhoto", formData);
      setTimeout(this.clearMessage, 5000);
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
    clearMessage() {
      this.$store.commit("post/setPostValidationMessage", null);
      this.$store.commit("post/setPhotoValidationMessage", null);
    },
    takeFile(event) {
      return event.target.files[0];
    },
  },
};
</script>
