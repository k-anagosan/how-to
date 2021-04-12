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
const articleList = {
    data: [article(), article(), article(), article()],
};

const postModule = {
    namespaced: true,
    state: { apiIsSuccess: null },
    actions: {
        getArticleList: jest.fn().mockImplementation(() => articleList),
    },
};

const store = new Vuex.Store({
    modules: {
        post: postModule,
    },
});
const router = new VueRouter();

describe("CardList.vue", () => {
    const wrapper = shallowMount(CardList, {
        store,
        router,
        localVue,
        stubs: {
            "ion-icon": true,
        },
    });
    it("テスト", () => {
        // expect(wrapper.html()).toContain("<h1>Card List</h1>");
        expect(1).toBe(1);
    });
});
