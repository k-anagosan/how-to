import TestUtils from "@/testutils";
import TaggedArticleList from "@/pages/TaggedArticleList.vue";
import { randomStr } from "../utils";

const Test = new TestUtils();
const spyFetchArticleList = jest.spyOn(TaggedArticleList.methods, "fetchArticleList");
Test.setSpys({ spyFetchArticleList });

const article = () => ({
    id: randomStr(20),
    title: randomStr(30),
    content: randomStr(100),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: {
        name: randomStr(10),
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

const response = responseFactory(current_page, per_page, last_page);

const post = {
    namespaced: true,
    actions: { getArticleList: jest.fn().mockImplementation(() => ({ ...response })) },
};
const auth = {
    namespaced: true,
    state: { user: "testuser" },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
    },
    getters: {},
};

Test.setSpys({ getArticleList: post.actions.getArticleList });

Test.setVueRouter();
let store = Test.setVuex({ post, auth });

const options = {
    propsData: {
        page: current_page,
        tag: randomStr(10),
    },
    stubs: {
        "ion-icon": true,
    },
};

let wrapper = null;
beforeEach(() => {
    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(TaggedArticleList, options);
    wrapper = Test.shallowWrapperFactory();
    expect(spyFetchArticleList).toHaveBeenCalled();
    expect(post.actions.getArticleList).toHaveBeenCalled();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("ページアクセスしたらdataに記事一覧情報が保存される", () => {
        expect(wrapper.vm.$data.list).toEqual(response.data);
    });
    it("ページアクセスしたらdataにページネーション情報が保存される", () => {
        const pagination = { ...response };
        delete pagination.data;
        expect(wrapper.vm.$data.pagination).toEqual(pagination);
    });

    it("dataにlistが保存されたら記事一覧が表示される", () => {
        expect(wrapper.find("cardlist-stub").props().list).toEqual(response.data);
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#cardlist").exists()).toBe(!isShown);
    });
});

describe("いいね関連", () => {
    let [spyOnChangeLike, spyClearLike] = [null, null];

    beforeEach(() => {
        spyOnChangeLike = jest.spyOn(TaggedArticleList.methods, "onChangeLike");
        spyClearLike = jest.spyOn(TaggedArticleList.methods, "clearLike");
        Test.setSpys({ spyOnChangeLike, spyClearLike });
        wrapper = Test.shallowWrapperFactory();
    });

    it("changeLikeイベントが発火されたらonChangeLike()が実行される", () => {
        expect(spyOnChangeLike).not.toHaveBeenCalled();
        wrapper.find("cardlist-stub").vm.$emit("changeLike", { id: randomStr(20), isLiked: true });
        expect(spyOnChangeLike).toHaveBeenCalled();
    });

    it.each([
        ["増え", true],
        ["減り", false],
    ])("onChangeLike()によりいいね数が1つ%s、liked_by_meが%sとなる", (_, isLiked) => {
        const changedId = 1;
        if (!isLiked) wrapper.vm.$data.list[changedId].liked_by_me = true;

        const id = response.data[changedId];
        wrapper.vm.onChangeLike({ id, isLiked });
        const expected = { ...response };
        if (isLiked) {
            expected.data[changedId].likes_count += 1;
            expected.data[changedId].liked_by_me = true;
        } else {
            expected.data[changedId].likes_count -= 1;
            expected.data[changedId].liked_by_me = false;
        }
        wrapper.vm.$data.list.forEach((data, index) => {
            if (index === changedId) {
                expect(data).toEqual(expected.data[changedId]);
            } else {
                expect(data).toEqual(response.data[index]);
            }
        });
    });

    it("ログアウト時にclearLike()が実行される", async () => {
        auth.getters.isAuthenticated = state => Boolean(state.user);
        const spyClearLike = jest.spyOn(TaggedArticleList.methods, "clearLike").mockImplementation(() => {});
        Test.setVuex({ post, auth });
        wrapper = Test.shallowWrapperFactory();

        expect(spyClearLike).not.toHaveBeenCalled();
        await wrapper.vm.$store.commit("auth/setUser", null);
        expect(spyClearLike).toHaveBeenCalled();
        spyClearLike.mockRestore();
    });

    it("clearLike()によりすべてのarticle.liked_by_meがfalseになる", async () => {
        wrapper.vm.$data.list.forEach(article => {
            article.liked_by_me = true;
        });
        await wrapper.vm.clearLike();
        wrapper.vm.$data.list.forEach(article => {
            expect(article.liked_by_me).toBe(false);
        });
    });
});

describe("アーカイブ関連", () => {
    let spyOnChangeArchive = null;

    beforeEach(() => {
        spyOnChangeArchive = jest.spyOn(TaggedArticleList.methods, "onChangeArchive");
        Test.setSpys({ spyOnChangeArchive });
        wrapper = Test.shallowWrapperFactory();
    });

    it("changeArchiveイベントが発火されたらonChangeArchive()が実行される", () => {
        expect(spyOnChangeArchive).not.toHaveBeenCalled();
        wrapper.find("cardlist-stub").vm.$emit("changeArchive", { id: randomStr(20), isArchived: true });
        expect(spyOnChangeArchive).toHaveBeenCalled();
    });

    it.each([
        ["archived_by_meがtrue", true],
        ["archived_by_meがfalse", false],
    ])("onChangeArchive()により%sとなる", (_, isArchived) => {
        const changedId = 1;
        if (!isArchived) wrapper.vm.$data.list[changedId].archived_by_me = true;

        const id = response.data[changedId];
        wrapper.vm.onChangeArchive({ id, isArchived });
        const expected = { ...response };
        expected.data[changedId].archived_by_me = isArchived;
        wrapper.vm.$data.list.forEach((data, index) => {
            if (index === changedId) {
                expect(data).toEqual(expected.data[changedId]);
            } else {
                expect(data).toEqual(response.data[index]);
            }
        });
    });
});

describe("Vuex", () => {
    it.each([
        ["nullじゃない", true],
        ["nullの", false],
    ])("storeのstate.userが%s時、getters['auth/isAuthenticated']が%sを返す", (_, isAuth) => {
        auth.getters.isAuthenticated = () => isAuth;
        store = Test.setVuex({ post, auth });
        expect(Test.computedValue("isAuth", { $store: store })).toBe(isAuth);
    });
});
