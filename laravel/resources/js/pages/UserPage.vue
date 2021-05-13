<template>
  <div>
    <Spinner v-if="loading" class="pagetop-offset" />
    <div
      v-if="!loading"
      id="userpage"
      class="container mx-auto flex md:flex-row flex-col xl:px-32 sm:p-8 pagetop-offset"
    >
      <aside class="md:m-0 mb-8 xl:w-1/4 md:w-1/3 w-full">
        <div class="grid gap-y-4 bg-white p-4 shadow-md">
          <div>
            <figure class="flex justify-center items-center h-24">
              <div class="h-20 w-20 bg-black rounded-full"></div>
            </figure>
            <h2 id="username" class="text-center text-xl text-gray-600">@{{ name }}</h2>
          </div>
          <div v-if="!loginUser || loginUser.name !== name" class="flex items-center justify-center">
            <FollowButton class="py-1 px-2 w-40" :is-following="followed_by_me" @follow="onFollow" />
          </div>
          <ul class="sm:px-4 pb-4 grid gap-y-1 grid-cols-1">
            <li class="articles text-xl">
              <RouterLink
                :to="`/user/${name}`"
                class="flex items-center px-4 py-2 text-gray-500"
                :class="{ active: $route.path.match(/^\/user\/\w+$/) }"
                ><ion-icon name="document-text-outline" class="mr-2"></ion-icon>Articles</RouterLink
              >
            </li>
            <li v-if="loginUser && loginUser.name === name" class="archives text-xl">
              <RouterLink
                :to="`/user/${name}/archives`"
                class="flex items-center px-4 py-2 text-gray-500"
                :class="{ active: $route.path.match(/^\/user\/\w+\/archives$/) }"
                ><ion-icon name="archive-outline" class="mr-2"></ion-icon>Archives</RouterLink
              >
            </li>
            <li class="likes text-xl">
              <RouterLink
                :to="`/user/${name}/likes`"
                class="flex items-center px-4 py-2 text-gray-500"
                :class="{ active: $route.path.match(/^\/user\/\w+\/likes$/) }"
                ><ion-icon name="thumbs-up-outline" class="mr-2"></ion-icon>Likes</RouterLink
              >
            </li>
            <li class="followers text-xl">
              <RouterLink
                :to="`/user/${name}/followers`"
                class="flex items-center px-4 py-2 text-gray-500"
                :class="{ active: $route.path.match(/^\/user\/\w+\/followers$/) }"
                ><ion-icon name="person-outline" class="mr-2"></ion-icon>Followers</RouterLink
              >
            </li>
          </ul>
        </div>
      </aside>
      <div class="lg:ml-8 md:ml-4 xl:w-3/4 md:w-2/3 w-full">
        <RouterView :username="name" :page="page" @follow="onFollow" />
      </div>
    </div>
  </div>
</template>

<script>
import FollowButton from "../components/FollowButton.vue";
import Spinner from "../components/Spinner.vue";
import { mapState } from "vuex";

export default {
  components: {
    FollowButton,
    Spinner,
  },
  beforeRouteLeave(to, from, next) {
    this.clearPageData();
    next();
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.name !== from.params.name) {
      this.clearUserData();
      this.clearPageData();
    }
    next();
  },
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
      followed_by_me: false,
      loading: false,
    };
  },
  computed: {
    ...mapState({
      loginUser: state => state.auth.user,
      apiIsSuccess: state => state.auth.apiIsSuccess,
    }),
  },
  watch: {
    $route: {
      async handler() {
        if (this.userId) return;
        this.loading = true;
        await this.fetchUserPageData();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    async fetchUserPageData() {
      const user = await this.$store.dispatch("userpage/getUserPageData", this.name);
      if (!user) return;
      this.userId = user.id;
      this.followed_by_me = user.followed_by_me;
    },
    clearPageData() {
      this.$store.commit("userpage/setArticles", null, { root: true });
      this.$store.commit("userpage/setArchives", null, { root: true });
      this.$store.commit("userpage/setLikes", null, { root: true });
      this.$store.commit("userpage/setFollowers", null, { root: true });
    },
    clearUserData() {
      this.userId = null;
      this.followed_by_me = false;
    },
    async onFollow(e) {
      await this.$store.dispatch(e.isFollowing ? "auth/putFollow" : "auth/deleteFollow", e.id ?? this.userId);
      if (!e.id && this.apiIsSuccess) {
        this.followed_by_me = e.isFollowing;
      }
    },
  },
};
</script>

<style>
.active {
  color: rgba(59, 130, 246, 1);
  background-color: rgba(219, 234, 254, 1);
  font-weight: bold;
  border-radius: 999px;
}
</style>
