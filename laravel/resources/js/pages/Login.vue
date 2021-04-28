<template>
  <div class="max-w-screen-sm pagetop-offset mx-auto">
    <Spinner v-if="loading" size="sm" class="sm:hidden" />
    <Spinner v-if="loading" class="sm:block hidden" />
    <div v-if="!loading" id="login" class="sm:mx-0 mx-4">
      <ul class="flex justify-start items-center h-12">
        <li class="h-full mr-2 relative">
          <button
            id="login-tab"
            :class="{ 'text-gray-900 font-bold': tab === 1 }"
            class="flex justify-center items-center h-full px-4 text-gray-500 outline-none focus:outline-none"
            @click="tab = 1"
          >
            Login
          </button>
          <span class="absolute bottom-0 h-0.5 w-full bg-gray-300" :class="{ 'bg-gray-900': tab === 1 }"></span>
        </li>
        <li class="h-full mr-2 relative">
          <button
            id="register-tab"
            :class="{ 'text-gray-900 font-bold': tab === 2 }"
            class="flex justify-center items-center h-full px-4 text-gray-500 outline-none focus:outline-none"
            @click="tab = 2"
          >
            Register
          </button>
          <span class="absolute bottom-0 h-0.5 w-full bg-gray-300" :class="{ 'bg-gray-900': tab === 2 }"></span>
        </li>
      </ul>
      <div v-show="tab === 1" class="pt-4">
        <form id="login-form" @submit.prevent="login">
          <Input id="login-email" v-model="loginForm.email" type="text" label="Email" />
          <Input id="login-password" v-model="loginForm.password" type="password" label="Password" />
          <div class="flex justify-end">
            <Button id="login-btn" type="submit">login</Button>
          </div>
        </form>
      </div>
      <div v-show="tab === 2" class="pt-4">
        <form id="register-form" @submit.prevent="register">
          <Input id="username" v-model="registerForm.name" type="text" label="Username" />
          <Input id="email" v-model="registerForm.email" type="text" label="Email" />
          <Input id="password" v-model="registerForm.password" type="password" label="Password" />
          <Input
            id="password-confirmation"
            v-model="registerForm.password_confirmation"
            type="password"
            label="Password (Confirm)"
          />
          <div class="flex justify-end">
            <Button id="register-btn" type="submit">register</Button>
          </div>
        </form>
      </div>
    </div>
    <ErrorMessages :errors="loginErrors" @clear="clearMessage" />
    <ErrorMessages :errors="registerErrors" @clear="clearMessage" />
  </div>
</template>
<script>
import Input from "../components/Input.vue";
import Button from "../components/SubmitButton.vue";
import ErrorMessages from "../components/ErrorMessages.vue";
import Spinner from "../components/Spinner.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    Input,
    Button,
    Spinner,
    ErrorMessages,
  },
  data() {
    return {
      tab: 1,
      loginForm: {
        email: "",
        password: "",
      },
      registerForm: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      },
      timerId: null,
    };
  },

  computed: {
    ...mapState({
      apiIsSuccess: state => state.auth.apiIsSuccess,
    }),
    ...mapGetters({
      registerErrors: "auth/registerErrors",
      loginErrors: "auth/loginErrors",
    }),
    loading() {
      return this.apiIsSuccess === null;
    },
  },
  watch: {
    tab() {
      this.clearMessage();
    },
  },
  created() {
    this.clearMessage();
  },
  methods: {
    async login() {
      this.clearTimer();
      this.clearMessage();
      await this.$store.dispatch("auth/login", this.loginForm);
      if (this.apiIsSuccess) {
        this.$router.push("/");
      }
      this.setTimer();
    },
    async register() {
      this.clearTimer();
      this.clearMessage();
      await this.$store.dispatch("auth/register", this.registerForm);
      if (this.apiIsSuccess) {
        this.$router.push("/");
      }
      this.setTimer();
    },
    clearTimer() {
      clearTimeout(this.timerId);
    },
    setTimer() {
      this.timerId = setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },
    clearMessage() {
      this.$store.commit("auth/setLoginValidationMessage", null);
      this.$store.commit("auth/setRegisterValidationMessage", null);
    },
  },
};
</script>
