<template>
  <div class="max-w-screen-sm pagetop-offset mx-auto">
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
        <span
          class="absolute bottom-0 h-0.5 w-full bg-gray-300"
          :class="{ 'bg-gray-900': tab === 1 }"
        ></span>
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
        <span
          class="absolute bottom-0 h-0.5 w-full bg-gray-300"
          :class="{ 'bg-gray-900': tab === 2 }"
        ></span>
      </li>
    </ul>
    <div v-show="tab === 1" class="pt-4">
      <form id="login-form" @submit.prevent="login">
        <ValidationMessage :errors="loginErrors" element="email" />
        <Input
          id="login-email"
          v-model="loginForm.email"
          type="text"
          label="Email"
        />
        <ValidationMessage :errors="loginErrors" element="password" />
        <Input
          id="login-password"
          v-model="loginForm.password"
          type="password"
          label="Password"
        />
        <div class="flex justify-end">
          <Button id="login-btn" type="submit">login</Button>
        </div>
      </form>
    </div>
    <div v-show="tab === 2" class="pt-4">
      <form id="register-form" @submit.prevent="register">
        <ValidationMessage :errors="registerErrors" element="name" />
        <Input
          id="username"
          v-model="registerForm.name"
          type="text"
          label="Username"
        />
        <ValidationMessage :errors="registerErrors" element="email" />
        <Input
          id="email"
          v-model="registerForm.email"
          type="text"
          label="Email"
        />
        <ValidationMessage :errors="registerErrors" element="password" />
        <Input
          id="password"
          v-model="registerForm.password"
          type="password"
          label="Password"
        />
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
</template>
<script>
import Input from "../components/Input.vue";
import Button from "../components/SubmitButton.vue";
import ValidationMessage from "../components/ValidationMessage.vue";
import { mapState } from "vuex";

export default {
  components: {
    Input,
    Button,
    ValidationMessage,
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
    };
  },

  computed: {
    ...mapState({
      apiIsSuccess: state => state.auth.apiIsSuccess,
      loginErrors: state => state.auth.loginValidationMessage,
      registerErrors: state => state.auth.registerValidationMessage,
    }),
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
      await this.$store.dispatch("auth/login", this.loginForm);
      if (this.apiIsSuccess) {
        this.$router.push("/");
      }
    },
    async register() {
      await this.$store.dispatch("auth/register", this.registerForm);
      if (this.apiIsSuccess) {
        this.$router.push("/");
      }
    },
    clearMessage() {
      this.$store.commit("auth/setLoginValidationMessage", null);
      this.$store.commit("auth/setRegisterValidationMessage", null);
    },
  },
};
</script>
