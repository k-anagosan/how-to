import Vue from "vue";
import VueRouter from "vue-router";

import store from "./store/index";

import CardList from "./pages/CardList.vue";
import Login from "./pages/Login.vue";
import Edit from "./pages/Edit.vue";
import InternalServerError from "./pages/errors/InternalServerError.vue";

import { INTERNAL_SERVER_ERROR } from "./utils";

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
    {
        path: "/edit",
        component: Edit,
        beforeEnter(to, from, next) {
            if (store.getters["auth/isAuthenticated"]) {
                next();
            } else {
                next("/");
            }
        },
    },
    {
        path: "/500",
        component: InternalServerError,
        beforeEnter(to, from, next) {
            if (store.state.error.errorCode === INTERNAL_SERVER_ERROR) {
                next();
            } else {
                next("/");
            }
        },
    },
];

const router = new VueRouter({
    mode: "history",
    routes,
});

export default router;
