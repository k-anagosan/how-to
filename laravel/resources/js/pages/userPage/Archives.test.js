import TestUtils from "@/testutils";
import Archives from "@/pages/userPage/Archives.vue";
import { randomStr } from "../../utils";

const Test = new TestUtils();
const spyFetchPageData = jest.spyOn(Archives.methods, "fetchPageData");
const spySetData = jest.spyOn(Archives.methods, "setData");
const spyOnChangeLike = jest.spyOn(Archives.methods, "onChangeLike");
const spyOnChangeArchive = jest.spyOn(Archives.methods, "onChangeArchive");
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
    archived_by_me: true,
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
let [userpage, auth] = [null, null];
let wrapper = null;
let [spyDispatch, spyRouterPush] = [null, null];
beforeEach(async () => {
    response = responseFactory(current_page, per_page, last_page);
    userpage = {
        namespaced: true,
        state: { archives: null },
        mutations: {
            setLikes(state, likes) {
                state.likes = likes;
            },
            setArchives(state, archives) {
                state.archives = archives;
            },
        },
        actions: {
            getArchivedArticles: jest.fn().mockImplementation(context => {
                context.commit("setArchives", response);
            }),
        },
    };
    auth = {
        namespaced: true,
        getters: { username: jest.fn().mockImplementation(() => author) },
    };

    const router = Test.setVueRouter();
    const store = Test.setVuex({ userpage, auth });
    spyDispatch = jest.spyOn(store, "dispatch");
    spyRouterPush = jest.spyOn(router, "push");

    Test.setSpys({
        getArchivedArticles: userpage.actions.getArchivedArticles,
        spyDispatch,
        spyRouterPush,
    });
    const options = {
        propsData: { page: current_page, username: author },
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(Archives, options);
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

    it("pageData.length === 0がtrueならまだアーカイブしている記事がないメッセージを表示する", async () => {
        await wrapper.setData({ pageData: [] });
        expect(wrapper.find("h1").text()).toBe("まだ記事をアーカイブしていません");
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
        expect(wrapper.find("#archives").exists()).toBe(!isShown);
    });

    it("pageDataをCardListコンポーネントに渡せる", () => {
        expect(wrapper.find("cardlist-stub").props().list).toEqual(wrapper.vm.$data.pageData);
    });

    it("paginationをPaginationコンポーネントに渡せる", () => {
        expect(wrapper.find("pagination-stub").props().pagination).toEqual(wrapper.vm.$data.pagination);
        expect(wrapper.find("pagination-stub").props().to).toEqual(`/user/${wrapper.vm.username}/archives`);
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
        await wrapper.vm.$router.push("/user/xxx/archives");
        expect(spyFetchPageData).not.toHaveBeenCalled();
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
                    expect(article.archived_by_me).toBe(index === 0 ? !isArchived : true);
                });
                wrapper.vm.onChangeArchive(e);
                wrapper.vm.$data.pageData.forEach((article, index) => {
                    expect(article.archived_by_me).toBe(index === 0 ? isArchived : true);
                });
            }
        );
    });
});

describe("Vuex関連", () => {
    it("ページアクセスしたらgetArchivedArticlesアクションが実行される", () => {
        const payload = { name: author, page: current_page };
        expect(userpage.actions.getArchivedArticles).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch.mock.calls[0][1]).toEqual(payload);
    });

    it("articlesを正しく算出している", () => {
        expect(Test.computedValue("articles", { $store: wrapper.vm.$store })).toEqual(userpage.state.archives);
    });
    it("loginUsernameを正しく算出している", () => {
        expect(Test.computedValue("loginUsername", { $store: wrapper.vm.$store })).toEqual(author);
    });
});
