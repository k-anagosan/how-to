import Vuex from "vuex";
import VueRouter from "vue-router";

import { shallowMount, createLocalVue } from "@vue/test-utils";
import ArticleDetail from "@/pages/ArticleDetail.vue";

import { randomStr } from "@/utils";

const localVue = createLocalVue();

localVue.use(VueRouter);
localVue.use(Vuex);

const responseFactory = () => ({
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
});

const response = responseFactory();

const postModuleMock = {
    namespaced: true,
    actions: {
        getArticle: jest.fn().mockImplementation(() => ({ ...response })),
    },
};
const router = new VueRouter();
const store = new Vuex.Store({
    modules: {
        post: postModuleMock,
    },
});

const options = {
    store,
    router,
    localVue,
    propsData: { id: randomStr(20) },
    stubs: {
        "ion-icon": true,
    },
};

const factory = options => shallowMount(ArticleDetail, options);

const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");

let wrapper = null;
beforeEach(() => {
    wrapper = factory(options);
    spyFetchArticle.mock.calls = [];
});

describe("表示、入力関連", () => {
    beforeEach(async () => {
        const path = `/article/${randomStr(20)}`;
        await wrapper.vm.$router.push(path);
        expect(wrapper.vm.$route.path).toBe(path);
    });

    it("ページアクセスしたら記事データを取得できる", () => {
        expect(spyFetchArticle).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$data.article).toEqual(response);
    });

    it("記事データを取得したらMarkdownPreviewへarticle.contentを渡せる", () => {
        expect(wrapper.find("markdownpreview-stub").props().text).toEqual(
            response.content
        );
    });
});

describe("Vuex", () => {
    const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");
    beforeEach(() => {
        spyFetchArticle.mock.calls = [];
        postModuleMock.actions.getArticle.mock.calls = [];
    });
    it("ページアクセスしたらgetArticleアクションが実行される", async done => {
        expect(postModuleMock.actions.getArticle).not.toHaveBeenCalled();
        expect(spyFetchArticle).not.toHaveBeenCalled();
        await wrapper.vm.$router.push(`/article/${randomStr(20)}`);
        expect(postModuleMock.actions.getArticle).toHaveBeenCalled();
        expect(spyFetchArticle).toHaveBeenCalled();
        done();
    });
});
