import Vue from "vue";
import VueRouter from "vue-router";

import store from "./store/index";

import ArticleList from "./pages/ArticleList.vue";
import TaggedArticleList from "./pages/TaggedArticleList.vue";
import Login from "./pages/Login.vue";
import Edit from "./pages/Edit.vue";
import ArticleDetail from "./pages/ArticleDetail.vue";
import UserPage from "./pages/UserPage.vue";
import Logout from "./pages/Logout.vue";
import InternalServerError from "./pages/errors/InternalServerError.vue";
import NotFound from "./pages/errors/NotFound.vue";

import { INTERNAL_SERVER_ERROR } from "./utils";

Vue.use(VueRouter);

const pageRegex = page => (/^[1-9][0-9]*$/.test(page) ? parseInt(page, 10) : 1);

const routes = [
    {
        path: "/",
        component: ArticleList,
        props: route => {
            const page = route.query.page;
            return {
                page: pageRegex(page),
            };
        },
    },
    {
        path: "/tag/:tag",
        component: TaggedArticleList,
        props: route => {
            const page = route.query.page;
            return {
                page: pageRegex(page),
                tag: route.params.tag,
            };
        },
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
        path: "/article/:id",
        component: ArticleDetail,
        props: true,
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
    {
        path: "/user/:name",
        component: UserPage,
        props: route => {
            const page = route.query.page;
            return {
                page: pageRegex(page),
                name: route.params.name,
            };
        },
    },
    {
        path: "/redirect",
        component: Logout,
    },
    {
        path: "*",
        component: NotFound,
    },
];

const router = new VueRouter({
    mode: "history",
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { x: 0, y: 0 };
    },
});

export default router;
