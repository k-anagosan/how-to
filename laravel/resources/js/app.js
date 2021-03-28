import "./bootstrap";
import Vue from "vue";

import marked from "./marked";
import DOMPurify from "dompurify";
import store from "./store/index";
import router from "./router";
import App from "./App.vue";

Vue.prototype.$marked = marked;
Vue.prototype.$dompurity = DOMPurify;

const createApp = async () => {
    await store.dispatch("auth/getCurrentUser");
    new Vue({
        el: "#app",
        router,
        store,
        components: { App },
        template: "<App />",
    });
};

createApp();
