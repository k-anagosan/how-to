import { mount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import router from "@/router";

import Vuex from "vuex";
import store from "@/store/index";

import App from "@/App.vue";
import CardList from "@/pages/CardList.vue";
import Login from "@/pages/Login.vue";
import Edit from "@/pages/Edit.vue";
import ArticleDetail from "@/pages/ArticleDetail.vue";
import InternalServerError from "@/pages/errors/InternalServerError.vue";
import NotFound from "@/pages/errors/NotFound.vue";

import { randomStr, INTERNAL_SERVER_ERROR, NOT_FOUND } from "./utils";

jest.mock("@/pages/CardList.vue", () => ({
    name: "CardList",
    render: h => h("h1", "CardList"),
}));
jest.mock("@/pages/Login.vue", () => ({
    name: "Login",
    render: h => h("h1", "Login"),
}));
jest.mock("@/pages/Edit.vue", () => ({
    name: "Edit",
    render: h => h("h1", "Edit"),
}));
jest.mock("@/pages/ArticleDetail.vue", () => ({
    name: "ArticleDetail",
    render: h => h("h1", "ArticleDetail"),
}));
jest.mock("@/pages/errors/InternalServerError.vue", () => ({
    name: "InternalServerError",
    render: h => h("h1", "InternalServerError"),
}));
jest.mock("@/pages/errors/NotFound.vue", () => ({
    name: "NotFound",
    render: h => h("h1", "NotFound"),
}));

let wrapper = null;
const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(Vuex);

beforeEach(() => {
    wrapper = mount(App, {
        localVue,
        router,
        store,
        stubs: {
            Header: true,
            Footer: true,
        },
    });
});

afterEach(() => {
    wrapper.destroy();
    wrapper.vm.$router.push("/").catch(() => {});
});

describe("アクセス結果", () => {
    it("/にアクセスしたらCardListを表示する", async done => {
        const uri = randomStr();
        await wrapper.vm.$router.push(`/${uri}`).catch(() => {});
        await wrapper.vm.$router.push("/").catch(() => {});
        expect(wrapper.findComponent(CardList).exists()).toBe(true);
        done();
    });

    it("/loginにアクセスしたらLoginを表示する", async done => {
        await wrapper.vm.$router.push("/login").catch(() => {});
        expect(wrapper.findComponent(Login).exists()).toBe(true);
        done();
    });

    it("ログイン中に/editにアクセスしたらEditを表示する", async done => {
        wrapper.vm.$store.commit("auth/setUser", true);
        expect(wrapper.vm.$route.path).toBe("/");
        await wrapper.vm.$router.push("/edit").catch(() => {});
        expect(wrapper.findComponent(Edit).exists()).toBe(true);
        done();
    });

    it("/article/xxxにアクセスしたらArticleDetailを表示する", async done => {
        await wrapper.vm.$router
            .push(`/article/${randomStr(20)}`)
            .catch(() => {});
        expect(wrapper.findComponent(ArticleDetail).exists()).toBe(true);
        done();
    });

    it("設定していないルートにアクセスしたらNotFoundを表示する", async done => {
        await wrapper.vm.$router.push(`/${randomStr(10)}`).catch(() => {});
        expect(wrapper.findComponent(NotFound).exists()).toBe(true);
        done();
    });
});

describe("リダイレクト", () => {
    it("ログイン中に/loginにアクセスしたら/にリダイレクトされる", async done => {
        wrapper.vm.$store.commit("auth/setUser", true);
        expect(wrapper.vm.$route.path).toBe("/");
        await wrapper.vm.$router.push("/login").catch(() => {});
        expect(wrapper.vm.$route.path).toBe("/");
        done();
    });

    it("未認証中に/editにアクセスしたら/にリダイレクトされる", async done => {
        wrapper.vm.$store.commit("auth/setUser", null);
        expect(wrapper.vm.$route.path).toBe("/");
        await wrapper.vm.$router.push("/edit").catch(() => {});
        expect(wrapper.vm.$route.path).toBe("/");
        done();
    });

    it("ステータスコード404が確認されたら/not-foundにリダイレクト", async done => {
        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$store.commit("error/setErrorCode", NOT_FOUND);

        expect(wrapper.vm.$route.path).toBe("/not-found");
        expect(wrapper.findComponent(NotFound).exists()).toBe(true);
        done();
    });

    it("ステータスコード500が確認されたら/500にリダイレクト", async done => {
        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$store.commit(
            "error/setErrorCode",
            INTERNAL_SERVER_ERROR
        );

        expect(wrapper.vm.$route.path).toBe("/500");
        expect(wrapper.findComponent(InternalServerError).exists()).toBe(true);
        done();
    });
});
