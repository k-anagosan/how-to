import Vue from "vue";
import VueRouter from "vue-router";

import store from "./store/index";

import CardList from "./pages/CardList.vue";
import Login from "./pages/Login.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        component: CardList,
    },
    {
        path: "/login",
        component: Login,
        beforeEnter(to, from, next) {
            if (store.getters["auth/isAuthenticated"]) {
                next("/");
            } else {
                next();
            }
        },
    },
];

const router = new VueRouter({
    mode: "history",
    routes,
});

export default router;
