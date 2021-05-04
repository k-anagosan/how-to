import TestUtils from "@/testutils";
import Articles from "@/pages/userPage/Articles.vue";
import { randomStr } from "../../utils";

const Test = new TestUtils();
const spyFetchPageData = jest.spyOn(Articles.methods, "fetchPageData");
const spySetData = jest.spyOn(Articles.methods, "setData");
const spyPush = jest.spyOn(Articles.methods, "push");
Test.setSpys({ spyFetchPageData, spySetData });

const author = randomStr();
const article = () => ({
    id: randomStr(20),
    title: randomStr(30),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: {
        name: author,
    },
    liked_by_me: false,
    likes_count: 10,
});
const responseFactory = (current_page, per_page, last_page) => ({
    current_page,
    data: [...Array(per_page)].map(article),
    per_page,
    last_page,
});

const { current_page, per_page, last_page } = {
    current_page: 1,
    per_page: 4,
    last_page: 3,
};

const response = responseFactory(current_page, per_page, last_page);

let userpage = null;
let wrapper = null;
let [spyDispatch, spyRouterPush] = [null, null];
beforeEach(async () => {
    userpage = {
        namespaced: true,
        state: { articles: null },
        mutations: {
            setArticles(state, articles) {
                state.articles = articles;
            },
        },
        actions: {
            getArticles: jest.fn().mockImplementation(context => {
                context.commit("setArticles", response);
            }),
        },
    };

    const router = Test.setVueRouter();
    const store = Test.setVuex({ userpage });
    spyDispatch = jest.spyOn(store, "dispatch");
    spyRouterPush = jest.spyOn(router, "push");

    Test.setSpys({ getArticles: userpage.actions.getArticles, spyDispatch, spyRouterPush });
    const options = {
        propsData: { page: current_page, username: author },
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(Articles, options);
    wrapper = await Test.shallowWrapperFactory();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("ページアクセスしたらdataにpageDataが保存される", () => {
        expect(wrapper.vm.$data.pageData).toEqual(response.data);
    });
    it("ページアクセスしたらdataにpaginationが保存される", () => {
        const res = { ...response };
        delete res.data;
        expect(wrapper.vm.$data.pagination).toEqual(res);
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#articles").exists()).toBe(!isShown);
    });

    it("pageDataのデータをもとに記事リンクが正しく表示される", () => {
        wrapper.findAll(".article").wrappers.forEach((wrapper, index) => {
            const article = response.data[index];
            expect(wrapper.find("h2").text()).toBe(article.title);
            wrapper.findAll(".tag").wrappers.forEach((wrapper, index) => {
                expect(wrapper.text()).toBe(article.tags[index].name);
            });
        });
    });

    it("paginationのデータをPaginationコンポーネントに渡せる", () => {
        expect(wrapper.find("pagination-stub").props().pagination).toEqual(wrapper.vm.$data.pagination);
        expect(wrapper.find("pagination-stub").props().to).toEqual(`/user/${wrapper.vm.username}`);
    });
});

describe("メソッド関連", () => {
    it.each([
        ["fetchPageData", spyFetchPageData],
        ["setData", spySetData],
    ])("ページアクセスしたら%sが実行される", (_, spy) => {
        expect(spy).toHaveBeenCalled();
    });

    it("記事リンクをクリックしたらpush()が実行される", () => {
        wrapper.findAll(".article").wrappers.forEach((wrapper, index) => {
            expect(spyPush).not.toHaveBeenCalled();
            wrapper.trigger("click");
            expect(spyPush).toHaveBeenCalled();
            expect(spyPush.mock.calls[0]).toEqual([response.data[index].id]);
            spyPush.mock.calls = [];
        });
    });

    it("push()を実行したらrouter.push()が実行される", () => {
        const id = randomStr();
        expect(spyRouterPush).not.toHaveBeenCalled();
        wrapper.vm.push(id);
        expect(spyRouterPush).toHaveBeenCalled();
        expect(spyRouterPush.mock.calls[0][0]).toBe(`/article/${id}`);
    });
});

describe("Vuex関連", () => {
    it("ページアクセスしたらgetArticlesアクションが実行される", () => {
        const payload = { name: author, page: current_page };
        expect(userpage.actions.getArticles).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch.mock.calls[0][1]).toEqual(payload);
    });

    it("articlesを正しく算出している", () => {
        expect(Test.computedValue("articles", { $store: wrapper.vm.$store })).toEqual(userpage.state.articles);
    });
});
