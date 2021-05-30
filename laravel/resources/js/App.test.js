import TestUtils from "@/testutils";
import router from "@/router";
import store from "@/store/index";

import App from "@/App.vue";
import ArticleList from "@/pages/ArticleList.vue";
import TaggedArticleList from "@/pages/TaggedArticleList.vue";
import Login from "@/pages/Login.vue";
import Edit from "@/pages/Edit.vue";
import ArticleDetail from "@/pages/ArticleDetail.vue";
import UserPage from "@/pages/UserPage.vue";
import InternalServerError from "@/pages/errors/InternalServerError.vue";
import NotFound from "@/pages/errors/NotFound.vue";
import PageExpired from "@/pages/errors/PageExpired.vue";

import { randomStr, UNAUTHENTICATED, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUHTORIZED_CLIENT } from "./utils";

jest.mock("@/pages/ArticleList.vue", () => ({
    name: "ArticleList",
    render: h => h("h1", "ArticleList"),
}));
jest.mock("@/pages/TaggedArticleList.vue", () => ({
    name: "TaggedArticleList",
    render: h => h("h1", "TaggedArticleList"),
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
jest.mock("@/pages/UserPage.vue", () => ({
    name: "UserPage",
    render: h => h("h1", "UserPage"),
}));
jest.mock("@/pages/errors/InternalServerError.vue", () => ({
    name: "InternalServerError",
    render: h => h("h1", "InternalServerError"),
}));
jest.mock("@/pages/errors/NotFound.vue", () => ({
    name: "NotFound",
    render: h => h("h1", "NotFound"),
}));
jest.mock("@/pages/errors/PageExpired.vue", () => ({
    name: "PageExpired",
    render: h => h("h1", "PageExpired"),
}));

const Test = new TestUtils();
Test.setMountOption(App, {
    stubs: {
        Header: true,
        Footer: true,
    },
});

let wrapper = null;
let spyGetCurrentUser = null;
beforeEach(() => {
    spyGetCurrentUser = jest.spyOn(App.methods, "getCurrentUser").mockImplementation(() => {});
    Test.setVuexInstance(store);
    Test.setVueRouterInstance(router);
    wrapper = Test.wrapperFactory();
});

afterEach(() => {
    wrapper.vm.$store.commit("auth/setUser", null);
    spyGetCurrentUser.mock.calls = [];
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper.destroy();
    wrapper = null;
});

describe("アクセス結果", () => {
    it.each([
        ["/にアクセスしたらArticleListを表示する", "/", ArticleList],
        ["/tag/xxxにアクセスしたらTaggedArticleListを表示する", "/tag/xxx", TaggedArticleList],
        ["/loginにアクセスしたらLoginを表示する", "/login", Login],
        ["ログイン中に/editにアクセスしたらEditを表示する", "/edit", Edit],
        ["/article/xxxにアクセスしたらArticleDetailを表示する", "/article/xxx", ArticleDetail],
        ["/user/xxxにアクセスしたらUserPageを表示する", "/user/xxx", UserPage],
        ["設定していないルートにアクセスしたらNotFoundを表示する", `/${randomStr(10)}`, NotFound],
    ])("%s", async (_, path, Component) => {
        if (path === "/edit") wrapper.vm.$store.commit("auth/setUser", true);
        await Test.testRoutingWithComponent("/", path, Component);
    });

    it("パスが変わるごとにgetCurrentUser()が実行される", async () => {
        expect(spyGetCurrentUser).not.toHaveBeenCalled();
        await wrapper.vm.$router.push(`/${randomStr()}`);
        expect(spyGetCurrentUser).toHaveBeenCalled();
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
        ["401が確認されたら/loginにリダイレクト", UNAUTHENTICATED, "/login", Login],
        ["404が確認されたら/not-foundにリダイレクト", NOT_FOUND, "/not-found", NotFound],
        ["419が確認されたら/page-expiredにリダイレクト", UNAUHTORIZED_CLIENT, "/page-expired", PageExpired],
        ["500が確認されたら/500にリダイレクト", INTERNAL_SERVER_ERROR, "/500", InternalServerError],
    ])("%s", async (_, status, path, Component) => {
        await wrapper.vm.$store.commit("error/setErrorCode", status);
        await Test.testRoutingWithComponent(path, null, Component);
    });
});
