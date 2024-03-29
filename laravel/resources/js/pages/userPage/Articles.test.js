import TestUtils from "@/testutils";
import Articles from "@/pages/userPage/Articles.vue";
import { randomStr } from "../../utils";

const Test = new TestUtils();
const spyFetchPageData = jest.spyOn(Articles.methods, "fetchPageData");
const spySetData = jest.spyOn(Articles.methods, "setData");
const spyOnChangeLike = jest.spyOn(Articles.methods, "onChangeLike");
const spyOnChangeArchive = jest.spyOn(Articles.methods, "onChangeArchive");
Test.setSpys({ spyFetchPageData, spySetData, spyOnChangeLike, spyOnChangeArchive });

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
    archived_by_me: false,
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
let wrapper = null;
let [userpage, auth] = [null, null];
let [spyDispatch, spyRouterPush] = [null, null];
beforeEach(async () => {
    response = responseFactory(current_page, per_page, last_page);
    userpage = {
        namespaced: true,
        state: { articles: null },
        mutations: {
            setArticles(state, articles) {
                state.articles = articles;
            },
            setLikes: jest.fn(),
            setArchives: jest.fn(),
        },
        actions: {
            getArticles: jest.fn().mockImplementation(context => {
                context.commit("setArticles", response);
            }),
        },
    };
    auth = {
        namespaced: true,
        state: { user: { name: author } },
        getters: {
            username: state => state.user.name,
        },
    };

    const router = Test.setVueRouter();
    const store = Test.setVuex({ userpage, auth });
    spyDispatch = jest.spyOn(store, "dispatch");
    spyRouterPush = jest.spyOn(router, "push");

    Test.setSpys({
        getArticles: userpage.actions.getArticles,
        setLikes: userpage.mutations.setLikes,
        setArchives: userpage.mutations.setArchives,
        spyDispatch,
        spyRouterPush,
    });
    const options = {
        propsData: { page: current_page, username: author },
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(Articles, options);
    wrapper = await Test.shallowWrapperFactory();
});
afterEach(async () => {
    if (wrapper.vm.$route.path !== "/") await wrapper.vm.$router.push("/");
    Test.clearSpysCalledTimes();
    wrapper.destroy();
});

describe("表示関連", () => {
    it("ページアクセスしたらdataにpageDataが保存される", () => {
        expect(wrapper.vm.$data.pageData).toEqual(response.data);
    });

    it("pageData.length === 0がtrueならまだ記事を投稿していない内容のメッセージを表示する", async () => {
        await wrapper.setData({ pageData: [] });
        expect(wrapper.find("h1").text()).toBe("まだ記事を投稿していません");
    });

    it("pageData.length > 0がtrueなら投稿している記事を表示する", () => {
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
        expect(wrapper.find("#articles").exists()).toBe(!isShown);
    });

    it("pageDataをCardListコンポーネントに渡せる", () => {
        expect(wrapper.find("cardlist-stub").props().list).toEqual(wrapper.vm.$data.pageData);
    });

    it("owned-by-meをCardListコンポーネントに渡せる", () => {
        expect(wrapper.find("cardlist-stub").props().ownedByMe).toEqual(
            wrapper.vm.username === wrapper.vm.loginUsername
        );
    });

    it("paginationをPaginationコンポーネントに渡せる", () => {
        expect(wrapper.find("pagination-stub").props().pagination).toEqual(wrapper.vm.$data.pagination);
        expect(wrapper.find("pagination-stub").props().to).toEqual(`/user/${wrapper.vm.username}`);
    });
});

describe("メソッド関連", () => {
    it.each([
        ["fetchPageData", spyFetchPageData],
        ["setData", spySetData],
    ])("ページアクセスしたら%sが実行される", (method, spy) => {
        expect(spy).toHaveBeenCalled();
        if (method === "fetchPageData") {
            expect(spy.mock.calls[0][0]).toBe(current_page);
            expect(spyDispatch.mock.calls[0]).toEqual(["userpage/getArticles", { page: current_page, name: author }]);
        }
    });

    it("リンク変更後でpayloadが変わらなければfetchPageData()は実行されない", async done => {
        spyFetchPageData.mock.calls = [];
        await wrapper.vm.$router.push("/user/xxx");
        expect(spyFetchPageData).not.toHaveBeenCalled();
        done();
    });

    it.each([
        ["fetchPageData", spyFetchPageData],
        ["setData", spySetData],
    ])("stateのarticlesがリセットされたら%sが実行される", (method, spy) => {
        wrapper.vm.$store.commit("userpage/setArticles", null, { root: true });
        expect(spy).toHaveBeenCalled();
        if (method === "fetchPageData") {
            expect(spy.mock.calls[0][0]).toBe(current_page);
            expect(spyDispatch.mock.calls[0]).toEqual(["userpage/getArticles", { page: current_page, name: author }]);
        }
    });

    it("stateのarticlesがnull以外に変更された場合はfetchPageData()は実行されない", () => {
        spyFetchPageData.mock.calls = [];
        wrapper.vm.$store.commit("userpage/setArticles", { data: ["test"], last_page }, { root: true });
        expect(spyFetchPageData).not.toHaveBeenCalled();
    });

    it("pageDataが空でlast_pageが1より大きいならsetData()実行時に$router.push()が実行される", () => {
        wrapper.vm.$store.commit("userpage/setArticles", { data: [], last_page }, { root: true });
        spyRouterPush.mock.calls = [];
        wrapper.vm.setData();
        expect(spyRouterPush).toHaveBeenCalled();
        expect(spyRouterPush.mock.calls[0][0]).toBe(
            `/user/${wrapper.vm.username}?page=${wrapper.vm.$data.pagination.last_page}`
        );
    });

    it("pageDataが空でlast_pageが1ならsetData()実行時に$router.push()が実行されない", () => {
        wrapper.vm.$store.commit("userpage/setArticles", { data: [], last_page: 1 }, { root: true });
        spyRouterPush.mock.calls = [];
        wrapper.vm.setData();
        expect(spyRouterPush).not.toHaveBeenCalled();
    });

    it("pageDataが空でないならsetData()実行時に$router.push()が実行されない", () => {
        wrapper.vm.$store.commit("userpage/setArticles", { data: ["test1", "test2"], last_page }, { root: true });
        spyRouterPush.mock.calls = [];
        wrapper.vm.setData();
        expect(spyRouterPush).not.toHaveBeenCalled();
    });

    describe("いいね関連", () => {
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

        it.each([
            ["自身のユーザーページの/articles", "実行される", true],
            ["他のユーザーページの/articles", "実行されない", false],
        ])("onChangeLike()が%sで実行されたら、setLikesミューテーションが%s", (_, __, isOwned) => {
            if (!isOwned) {
                auth.state.user.name = randomStr();
                Test.setVuex({ auth, userpage });
                wrapper = Test.shallowWrapperFactory();
            }
            expect(spyOnChangeLike).not.toHaveBeenCalled();
            wrapper.vm.onChangeLike({ id: wrapper.vm.$data.pageData[0].id, isLiked: true });
            if (isOwned) {
                expect(userpage.mutations.setLikes).toHaveBeenCalled();
            } else {
                expect(userpage.mutations.setLikes).not.toHaveBeenCalled();
            }
        });
    });
    describe("アーカイブ関連", () => {
        it("changeArchiveイベントが発火されたらonChangeArchive()が実行される", () => {
            expect(spyOnChangeArchive).not.toHaveBeenCalled();
            const e = { id: response.data[0].id, isArchived: !response.data[0].archived_by_me };
            wrapper
                .find("cardlist-stub")
                .vm.$emit("changeArchive", { id: response.data[0].id, isArchived: !response.data[0].archived_by_me });
            expect(spyOnChangeArchive.mock.calls[0]).toEqual([e]);
        });

        it.each([[false], [true]])(
            "onChangeArchive()がisArchived: %sで実行されたらpageDataが反映される",
            isArchived => {
                response.data[0].archived_by_me = !isArchived;
                const e = { id: response.data[0].id, isArchived };
                wrapper.vm.$data.pageData.forEach((article, index) => {
                    expect(article.archived_by_me).toBe(index === 0 ? !isArchived : false);
                });
                wrapper.vm.onChangeArchive(e);
                wrapper.vm.$data.pageData.forEach((article, index) => {
                    expect(article.archived_by_me).toBe(index === 0 ? isArchived : false);
                });
            }
        );

        it.each([
            ["自身のユーザーページの/articles", "実行される", true],
            ["他のユーザーページの/articles", "実行されない", false],
        ])("onChangeArchive()が%sで実行されたら、setArchivesミューテーションが%s", (_, __, isOwned) => {
            if (!isOwned) {
                auth.state.user.name = randomStr();
                Test.setVuex({ auth, userpage });
                wrapper = Test.shallowWrapperFactory();
            }
            expect(spyOnChangeArchive).not.toHaveBeenCalled();
            wrapper.vm.onChangeArchive({ id: wrapper.vm.$data.pageData[0].id, isArchived: true });
            if (isOwned) {
                expect(userpage.mutations.setArchives).toHaveBeenCalled();
            } else {
                expect(userpage.mutations.setArchives).not.toHaveBeenCalled();
            }
        });
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

    it("loginUsernameを正しく算出している", () => {
        expect(Test.computedValue("loginUsername", { $store: wrapper.vm.$store })).toEqual(auth.state.user.name);
    });
});
