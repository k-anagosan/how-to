<template>
  <div>
    <div id="userpage" class="container mx-auto flex lg:flex-row flex-col lg:px-32 sm:p-8 pagetop-offset">
      <aside class="lg:m-0 mb-4 xl:w-1/4 lg:w-1/3 w-full">
        <div class="bg-white p-4 shadow-md">
          <figure class="flex justify-center items-center h-24">
            <div class="h-20 w-20 bg-black rounded-full"></div>
          </figure>
          <h2 id="username" class="text-center text-xl text-gray-600">@{{ name }}</h2>
          <ul class="mt-4 p-4 grid gap-y-2 grid-cols-1">
            <li class="articles text-xl">
              <RouterLink :to="`/user/${name}`" class="flex items-center"
                ><ion-icon name="document-text-outline" class="mr-2"></ion-icon>Articles</RouterLink
              >
            </li>
            <li v-if="username === name" class="archives text-xl">
              <RouterLink :to="`/user/${name}/archives`" class="flex items-center"
                ><ion-icon name="archive-outline" class="mr-2"></ion-icon>Archives</RouterLink
              >
            </li>
            <li class="likes text-xl">
              <RouterLink :to="`/user/${name}/likes`" class="flex items-center"
                ><ion-icon name="thumbs-up-outline" class="mr-2"></ion-icon>Likes</RouterLink
              >
            </li>
            <li class="followers text-xl">
              <RouterLink :to="`/user/${name}/followers`" class="flex items-center"
                ><ion-icon name="person-outline" class="mr-2"></ion-icon>Followers</RouterLink
              >
            </li>
          </ul>
        </div>
      </aside>
      <div class="lg:ml-4 xl:w-3/4 lg:w-2/3 w-full">
        <RouterView :username="name" :page="page" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      userId: null,
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
    }),
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        await this.fetchUserId();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchUserId() {
      this.userId = await this.$store.dispatch("userpage/getUserId", this.name);
    },
  },
};
</script>
