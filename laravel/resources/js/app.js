import "./bootstrap";
import Vue from "vue";

import store from "./store/index";
import router from "./router";
import App from "./App.vue";

new Vue({
    el: "#app",
    router,
    store,
    components: { App },
    async beforeCreate() {
        await store.dispatch("auth/getCurrentUser");
    },
    template: "<App />",
});
