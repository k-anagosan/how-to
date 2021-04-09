import Vuex from "vuex";
import VueRouter from "vue-router";

import { shallowMount, createLocalVue } from "@vue/test-utils";
import ArticleDetail from "@/pages/ArticleDetail.vue";

import { randomStr } from "@/utils";

const localVue = createLocalVue();

localVue.use(VueRouter);
localVue.use(Vuex);

let wrapper = null;

const article = {
    id: randomStr(20),
    title: randomStr(30),
    content: randomStr(100),
    tags: [
        { name: randomStr(10) },
        { name: randomStr(10) },
        { name: randomStr(10) },
    ],
    author: {
        name: randomStr(10),
    },
};

const postModuleMock = {
    namespaced: true,
    state: {
        apiIsSuccess: true,
    },
    actions: {
        getArticle: jest.fn().mockImplementation(() => article),
    },
};
const spyFormat = jest.spyOn(ArticleDetail.methods, "format");

beforeEach(() => {
    const router = new VueRouter({ mode: "history" });
    const store = new Vuex.Store({
        modules: {
            post: postModuleMock,
        },
    });
    const $marked = jest.fn().mockImplementation(val => val);
    const $dompurify = {
        sanitize: jest.fn().mockImplementation(val => val),
    };

    wrapper = shallowMount(ArticleDetail, {
        store,
        router,
        localVue,
        propsData: { id: randomStr(20) },
        stubs: {
            "ion-icon": true,
        },
        mocks: {
            $marked,
            $dompurify,
        },
    });
});

describe("表示、入力関連", () => {
    beforeEach(() => {
        spyFormat.mock.calls = [];
        wrapper.vm.$marked.mock.calls = [];
        wrapper.vm.$dompurify.sanitize.mock.calls = [];
    });
    it("ページアクセスしたら記事データを取得できる", async done => {
        await wrapper.vm.$router.push("/").catch(() => {});
        expect(wrapper.vm.$route.path).toBe("/");
        const path = `/article/${randomStr(20)}`;
        await wrapper.vm.$router.push(path);
        expect(wrapper.vm.$route.path).toBe(path);
        expect(wrapper.vm.$data.article).toEqual(article);
        done();
    });

    it("ページアクセスしたらformat()が実行される", async done => {
        expect(spyFormat).not.toHaveBeenCalled();
        await wrapper.vm.$router.push("/").catch(() => {});
        expect(wrapper.vm.$route.path).toBe("/");

        const path = `/article/${randomStr(20)}`;
        await wrapper.vm.$router.push(path);
        expect(spyFormat).toHaveBeenCalled();
        expect(wrapper.vm.$route.path).toBe(path);
        expect(wrapper.vm.$data.formattedContent).toEqual(`${article.content}`);
        done();
    });

    it("format()が実行されたサニタイズ処理が実行される", () => {
        expect(spyFormat).not.toHaveBeenCalled();
        expect(wrapper.vm.$marked).not.toHaveBeenCalled();
        expect(wrapper.vm.$dompurify.sanitize).not.toHaveBeenCalled();

        wrapper.vm.format(randomStr(100));

        expect(spyFormat).toHaveBeenCalled();
        expect(wrapper.vm.$marked).toHaveBeenCalled();
        expect(wrapper.vm.$dompurify.sanitize).toHaveBeenCalled();
    });
});

describe("Vuex", () => {
    const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");
    beforeEach(() => {
        spyFetchArticle.mock.calls = [];
        postModuleMock.actions.getArticle.mock.calls = [];
    });
    it("ページアクセスしたらgetArticleが実行される", async done => {
        expect(postModuleMock.actions.getArticle).not.toHaveBeenCalled();
        expect(spyFetchArticle).not.toHaveBeenCalled();
        await wrapper.vm.$router.push(`/article/${randomStr(20)}`);
        expect(postModuleMock.actions.getArticle).toHaveBeenCalled();
        expect(spyFetchArticle).toHaveBeenCalled();
        done();
    });
});
