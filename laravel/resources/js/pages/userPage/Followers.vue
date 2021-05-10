<template>
  <div>
    <Spinner v-if="loading" />
    <div v-if="!loading" id="followers">
      <div v-if="pageData !== null && pageData.length > 0" class="grid sm:gap-y-4 grid-cols-1">
        <div
          v-for="follower in pageData"
          :key="follower.name"
          class="follower flex justify-between items-center bg-white p-4 cursor-pointer sm:shadow-md sm:hover:shadow-xl transition-shadow hover:underline"
          @click="() => push(follower.name)"
        >
          <div class="flex justify-start items-center">
            <div class="rounded-full bg-black mr-2 icon-size-lg"></div>
            <h2>{{ follower.name }}</h2>
          </div>
          <div @click.stop>
            <FollowButton
              class="py-1 px-4"
              :is-following="follower.followed_by_me"
              @follow="e => onFollow(e, follower.id)"
            />
          </div>
        </div>
        <Pagination
          v-if="!loading && pagination && pageData.length > 0"
          class="sm:mx-0 mx-2"
          :pagination="pagination"
          :to="`/user/${username}/followers`"
        />
      </div>
      <div v-if="pageData === null || pageData.length === 0">
        <h1>まだ他のユーザーをフォローしていません</h1>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "../../components/Spinner.vue";
import Pagination from "../../components/Pagination.vue";
import FollowButton from "../../components/FollowButton.vue";
import { mapState } from "vuex";
export default {
  components: {
    Spinner,
    Pagination,
    FollowButton,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      pagination: null,
      pageData: null,
    };
  },
  computed: {
    ...mapState({
      followerList: state => state.userpage.followers,
    }),
  },
  watch: {
    $route: {
      async handler() {
        this.loading = true;
        if (!this.followerList || this.followerList.current_page !== this.page) {
          await this.fetchFollowerList();
        }
        this.setData();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    push(name) {
      this.$router.push(`/user/${name}`);
    },
    async fetchFollowerList() {
      const payload = { name: this.username, page: this.page };
      await this.$store.dispatch("userpage/getFollowerList", payload);
    },
    setData() {
      const followerList = { ...this.followerList };
      this.pageData = followerList.data;
      delete followerList.data;
      this.pagination = followerList;
    },
    onFollow(e, id) {
      this.$emit("follow", { isFollowing: e.isFollowing, id });
      this.refreshFollowedByMe(e.isFollowing, id);
    },
    refreshFollowedByMe(isFollowing, id) {
      const followersData = [...this.followerList.data];

      Object.keys(followersData).forEach(key => {
        if (followersData[key].id === id) {
          followersData[key].followed_by_me = isFollowing;
        }
      });

      const followerList = { ...this.followerList };

      followerList.data = followersData;

      this.$store.commit("userpage/setFollowers", followerList);
    },
  },
};
</script>
