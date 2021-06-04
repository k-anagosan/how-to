<template>
  <div>
    <Spinner v-if="loading" />
    <div v-if="!loading" id="setting">setting</div>
  </div>
</template>

<script>
import Spinner from "../../components/Spinner.vue";
export default {
  components: {
    Spinner,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
};
</script>
