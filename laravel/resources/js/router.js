import Vue from "vue";
import VueRouter from "vue-router";

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
    },
];

const router = new VueRouter({
    mode: "history",
    routes,
});

export default router;
