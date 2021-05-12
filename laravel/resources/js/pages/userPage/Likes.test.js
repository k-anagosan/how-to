import TestUtils from "@/testutils";
import Likes from "@/pages/userPage/Likes.vue";
import { randomStr } from "../../utils";

const Test = new TestUtils();
const spyFetchPageData = jest.spyOn(Likes.methods, "fetchPageData");
const spySetData = jest.spyOn(Likes.methods, "setData");
const spyOnChangeLike = jest.spyOn(Likes.methods, "onChangeLike");
Test.setSpys({ spyFetchPageData, spySetData, spyOnChangeLike });

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

let response = null;
let userpage = null;
let wrapper = null;
let [spyDispatch, spyRouterPush] = [null, null];
beforeEach(async () => {
    response = responseFactory(current_page, per_page, last_page);
    userpage = {
        namespaced: true,
        state: { likes: null },
        mutations: {
            setLikes(state, likes) {
                state.likes = likes;
            },
        },
        actions: {
            getLikedArticles: jest.fn().mockImplementation(context => {
                context.commit("setLikes", response);
            }),
        },
    };

    const router = Test.setVueRouter();
    const store = Test.setVuex({ userpage });
    spyDispatch = jest.spyOn(store, "dispatch");
    spyRouterPush = jest.spyOn(router, "push");

    Test.setSpys({ getLikedArticles: userpage.actions.getLikedArticles, spyDispatch, spyRouterPush });
    const options = {
        propsData: { page: current_page, username: author },
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(Likes, options);
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

    it("pageData.length === 0がtrueならまだいいねしている記事がないメッセージを表示する", async () => {
        await wrapper.setData({ pageData: [] });
        expect(wrapper.find("h1").text()).toBe("まだ記事をいいねしていません");
    });

    it("pageData.length > 0がtrueならいいねしている記事を表示する", () => {
        expect(wrapper.find("cardlist-stub").exists()).toBe(true);
        expect(wrapper.find("pagination-stub").exists()).toBe(true);
        expect(wrapper.find("h1").exists()).toBe(false);
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
        expect(wrapper.find("#likes").exists()).toBe(!isShown);
    });

    it("pageDataをCardListコンポーネントに渡せる", () => {
        expect(wrapper.find("cardlist-stub").props().list).toEqual(wrapper.vm.$data.pageData);
    });

    it("paginationをPaginationコンポーネントに渡せる", () => {
        expect(wrapper.find("pagination-stub").props().pagination).toEqual(wrapper.vm.$data.pagination);
        expect(wrapper.find("pagination-stub").props().to).toEqual(`/user/${wrapper.vm.username}/likes`);
    });
});

describe("メソッド関連", () => {
    it.each([
        ["fetchPageData", spyFetchPageData],
        ["setData", spySetData],
    ])("ページアクセスしたら%sが実行される", (_, spy) => {
        expect(spy).toHaveBeenCalled();
    });

    it("すでにarticlesがあり、articles.current_pageとpageが同じならfetchPageData()が実行されない", async () => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push("/user/xxx/likes");
        expect(spyFetchPageData).not.toHaveBeenCalled();
    });

    it("changeLikeイベントが発火されたらonChangeLike()が実行される", () => {
        expect(spyOnChangeLike).not.toHaveBeenCalled();
        const e = { id: response.data[0].id, isLiked: !response.data[0].liked_by_me };
        wrapper
            .find("cardlist-stub")
            .vm.$emit("changeLike", { id: response.data[0].id, isLiked: !response.data[0].liked_by_me });
        expect(spyOnChangeLike.mock.calls[0]).toEqual([e]);
    });

    it.each([[false], [true]])("onChangeLike()がisLiked: %sで実行されたらpageDataが反映される", isLiked => {
        response.data[0].liked_by_me = !isLiked;
        const e = { id: response.data[0].id, isLiked };
        wrapper.vm.$data.pageData.forEach((article, index) => {
            expect(article.likes_count).toBe(10);
            expect(article.liked_by_me).toBe(index === 0 ? !isLiked : false);
        });
        wrapper.vm.onChangeLike(e);
        wrapper.vm.$data.pageData.forEach((article, index) => {
            const likes_count = isLiked ? 11 : 9;
            expect(article.likes_count).toBe(index === 0 ? likes_count : 10);
            expect(article.liked_by_me).toBe(index === 0 ? isLiked : false);
        });
    });
});

describe("Vuex関連", () => {
    it("ページアクセスしたらgetLikedArticlesアクションが実行される", () => {
        const payload = { name: author, page: current_page };
        expect(userpage.actions.getLikedArticles).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch.mock.calls[0][1]).toEqual(payload);
    });

    it("articlesを正しく算出している", () => {
        expect(Test.computedValue("articles", { $store: wrapper.vm.$store })).toEqual(userpage.state.likes);
    });
});
