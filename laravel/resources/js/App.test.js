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
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper.destroy();
    wrapper = null;
});

describe("アクセス結果", () => {
    it("/にアクセスしたらCardListを表示する", async done => {
        await Test.testRoutingWithComponent("/", null, CardList);
        done();
    });

    it("/loginにアクセスしたらLoginを表示する", async done => {
        await Test.testRoutingWithComponent("/", "/login", Login);
        done();
    });

    it("ログイン中に/editにアクセスしたらEditを表示する", async done => {
        wrapper.vm.$store.commit("auth/setUser", true);
        await Test.testRoutingWithComponent("/", "/edit", Edit);
        done();
    });

    it("/article/xxxにアクセスしたらArticleDetailを表示する", async done => {
        await Test.testRoutingWithComponent(
            "/",
            `/article/${randomStr(20)}`,
            ArticleDetail
        );
        done();
    });

    it("設定していないルートにアクセスしたらNotFoundを表示する", async done => {
        await Test.testRoutingWithComponent("/", `/${randomStr(10)}`, NotFound);
        done();
    });
});

describe("リダイレクト", () => {
    it("ログイン中に/loginにアクセスしたら/にリダイレクトされる", async done => {
        wrapper.vm.$store.commit("auth/setUser", true);
        await Test.testRedirect("/", "/login", "/");
        done();
    });

    it("未認証中に/editにアクセスしたら/にリダイレクトされる", async done => {
        wrapper.vm.$store.commit("auth/setUser", null);
        await Test.testRedirect("/", "/edit", "/");
        done();
    });

    it("ステータスコード404が確認されたら/not-foundにリダイレクト", async done => {
        await wrapper.vm.$store.commit("error/setErrorCode", NOT_FOUND);
        await Test.testRoutingWithComponent("/not-found", null, NotFound);
        done();
    });

    it("ステータスコード500が確認されたら/500にリダイレクト", async done => {
        await wrapper.vm.$store.commit(
            "error/setErrorCode",
            INTERNAL_SERVER_ERROR
        );
        await Test.testRoutingWithComponent("/500", null, InternalServerError);
        done();
    });
});
