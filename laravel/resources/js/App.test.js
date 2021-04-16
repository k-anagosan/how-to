import TestUtils from "@/testutils";
import router from "@/router";
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

const Test = new TestUtils();
Test.setMountOption(App, {
    stubs: {
        Header: true,
        Footer: true,
    },
});

let wrapper = null;
beforeEach(() => {
    Test.setVuexInstance(store);
    Test.setVueRouterInstance(router);
    wrapper = Test.wrapperFactory();
});

afterEach(() => {
    wrapper.vm.$store.commit("auth/setUser", null);
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper.destroy();
    wrapper = null;
});

describe("アクセス結果", () => {
    it.each([
        ["/にアクセスしたらCardListを表示する", "/", CardList],
        ["/loginにアクセスしたらLoginを表示する", "/login", Login],
        ["ログイン中に/editにアクセスしたらEditを表示する", "/edit", Edit],
        ["/article/xxxにアクセスしたらArticleDetailを表示する", "/article/xxx", ArticleDetail],
        ["設定していないルートにアクセスしたらNotFoundを表示する", `/${randomStr(10)}`, NotFound],
    ])("%s", async (_, path, Component) => {
        if (path === "/edit") wrapper.vm.$store.commit("auth/setUser", true);
        await Test.testRoutingWithComponent("/", path, Component);
    });
});

describe("リダイレクト", () => {
    it.each([
        ["ログイン中に/loginにアクセスしたら/にリダイレクトされる", "/login", "/"],
        ["未認証中に/editにアクセスしたら/にリダイレクトされる", "/edit", "/"],
    ])("%s", async (_, to, redirectPath) => {
        if (to === "/login") wrapper.vm.$store.commit("auth/setUser", true);
        await Test.testRedirect("/", to, redirectPath);
    });

    it.each([
        ["404が確認されたら/not-foundにリダイレクト", NOT_FOUND, "/not-found", NotFound],
        ["500が確認されたら/500にリダイレクト", INTERNAL_SERVER_ERROR, "/500", InternalServerError],
    ])("%s", async (_, status, path, Component) => {
        await wrapper.vm.$store.commit("error/setErrorCode", status);
        await Test.testRoutingWithComponent(path, null, Component);
    });
});
