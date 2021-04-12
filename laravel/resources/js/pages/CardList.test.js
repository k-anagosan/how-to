import { shallowMount, createLocalVue } from "@vue/test-utils";
import CardList from "@/pages/CardList.vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
import { randomStr } from "../utils";

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(Vuex);

const article = () => ({
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
const responseFactory = (current_page, per_page, last_page) => ({
    current_page,
    data: Array(per_page).fill(null).map(article),
    per_page,
    last_page,
});

const { current_page, per_page, last_page } = {
    current_page: 1,
    per_page: 4,
    last_page: 3,
};

const response = responseFactory(current_page, per_page, last_page);

const postModule = {
    namespaced: true,
    state: { apiIsSuccess: null },
    actions: {
        getArticleList: jest.fn().mockImplementation(() => ({ ...response })),
    },
};

const store = new Vuex.Store({
    modules: {
        post: postModule,
    },
});
const router = new VueRouter();

const options = {
    store,
    router,
    localVue,
    stubs: {
        "ion-icon": true,
    },
    setProps: {
        page: current_page,
    },
};

const factory = options => shallowMount(CardList, options);

const spyFetchArticleList = jest.spyOn(CardList.methods, "fetchArticleList");

describe("表示関連", () => {
    let wrapper = null;

    beforeEach(() => {
        expect(spyFetchArticleList).not.toHaveBeenCalled();
        wrapper = factory(options);
    });

    afterEach(() => {
        spyFetchArticleList.mock.calls = [];
        wrapper = null;
    });

    it("ページアクセスしたらdataに記事一覧情報が保存される", () => {
        expect(spyFetchArticleList).toHaveBeenCalled();
        expect(wrapper.vm.$data.list).toEqual(response.data);
    });

    it("dataに記事一覧情報が保存されたら記事一覧が表示される", () => {
        expect(spyFetchArticleList).toHaveBeenCalled();
        expect(wrapper.findAll(".cardlist > li").length).toBe(per_page);
    });

    it("現在ページ数と総ページ数が'x / y'の形式で表示される", async done => {
        expect(spyFetchArticleList).toHaveBeenCalled();
        await wrapper.setData({ pagination: { current_page: 2 } });
        expect(wrapper.find(".current_page").text()).toBe(`2 / ${last_page}`);
        done();
    });

    it("1ページ目ならNewerが非表示になる", () => {
        expect(spyFetchArticleList).toHaveBeenCalled();
        expect(wrapper.find(".newer").exists()).toBe(false);
        expect(wrapper.find(".older").exists()).toBe(true);
    });

    it("1ページ目と最終ページでなければNewerとOlderが表示される", async done => {
        await wrapper.setData({ pagination: { current_page: 2 } });
        expect(spyFetchArticleList).toHaveBeenCalled();
        expect(wrapper.find(".newer").exists()).toBe(true);
        expect(wrapper.find(".older").exists()).toBe(true);
        done();
    });

    it("最終ページならOlderが非表示になる", async done => {
        await wrapper.setData({ pagination: { current_page: last_page } });
        expect(spyFetchArticleList).toHaveBeenCalled();
        expect(wrapper.find(".newer").exists()).toBe(true);
        expect(wrapper.find(".older").exists()).toBe(false);
        done();
    });
});

describe("Vuex", () => {
    let wrapper = null;
    beforeEach(() => {
        spyFetchArticleList.mock.calls = [];
        postModule.actions.getArticleList.mock.calls = [];
        expect(postModule.actions.getArticleList).not.toHaveBeenCalled();
        expect(spyFetchArticleList).not.toHaveBeenCalled();
        wrapper = factory(options);
    });

    it("ページアクセスしたらgetArticleListが実行される", async done => {
        await wrapper.vm.$router.push(`/`).catch(() => {});
        expect(postModule.actions.getArticleList).toHaveBeenCalled();
        expect(spyFetchArticleList).toHaveBeenCalled();
        done();
    });
});
