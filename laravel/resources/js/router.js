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
import PageExpired from "./pages/errors/PageExpired.vue";
import NotFound from "./pages/errors/NotFound.vue";
import Articles from "./pages/userPage/Articles.vue";
import Archives from "./pages/userPage/Archives.vue";
import Followers from "./pages/userPage/Followers.vue";
import Likes from "./pages/userPage/Likes.vue";

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
        path: "/user/:name",
        component: UserPage,
        props: route => {
            const page = route.query.page;
            return {
                page: pageRegex(page),
                name: route.params.name,
            };
        },
        children: [
            {
                path: "",
                component: Articles,
            },
            {
                path: "archives",
                component: Archives,
                beforeEnter(to, from, next) {
                    if (store.state.auth.user && store.state.auth.user.name === to.params.name) {
                        next();
                    } else {
                        next(`/user/${to.params.name}`);
                    }
                },
            },
            {
                path: "followers",
                component: Followers,
            },
            {
                path: "likes",
                component: Likes,
            },
        ],
    },
    {
        path: "/redirect",
        component: Logout,
    },
    {
        path: "/page-expired",
        component: PageExpired,
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
