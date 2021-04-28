import TestUtils from "@/testutils";
import UserPage from "@/pages/UserPage.vue";
import { randomStr } from "../utils";

const Test = new TestUtils();
const spyFetchPageData = jest.spyOn(UserPage.methods, "fetchPageData");
const spyPush = jest.spyOn(UserPage.methods, "push");
Test.setSpys({ spyFetchPageData, spyPush });

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
    user_id: 1,
});

const { current_page, per_page, last_page } = {
    current_page: 1,
    per_page: 4,
    last_page: 3,
};

const response = responseFactory(current_page, per_page, last_page);

const post = {
    namespaced: true,
    actions: { getUserPage: jest.fn().mockImplementation(() => ({ ...response })) },
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

Test.setSpys({ getUserPage: post.actions.getUserPage });

Test.setVueRouter();
Test.setVuex({ post, auth });

const options = {
    propsData: { page: current_page, name: author },
    stubs: { "ion-icon": true },
};

let wrapper = null;
beforeEach(() => {
    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(UserPage, options);
    wrapper = Test.shallowWrapperFactory();
    expect(spyFetchPageData).toHaveBeenCalled();
    expect(post.actions.getUserPage).toHaveBeenCalled();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("ページアクセスしたらdataに記事一覧情報が保存される", () => {
        expect(wrapper.vm.$data.pageData).toEqual(response.data);
    });
    it("ページアクセスしたらdataにページネーション情報が保存される", () => {
        const pagination = { ...response };
        delete pagination.data;
        delete pagination.user_id;
        expect(wrapper.vm.$data.pagination).toEqual(pagination);
    });
    it("ページアクセスしたらdataにuserIdが保存される", () => {
        const userId = response.user_id;
        expect(wrapper.vm.$data.userId).toBe(userId);
    });

    it.each([
        ["されたら記事一覧が表示される", true],
        ["されなかったら記事一覧が表示されない", false],
    ])("dataにpageDataが保存%s", async (_, exists) => {
        if (!exists) await wrapper.setData({ pageData: [] });
        expect(wrapper.findAll(".article").wrappers.length).toBe(exists ? per_page : 0);
        expect(wrapper.find("pagination-stub").exists()).toBe(exists);
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#userpage").exists()).toBe(!isShown);
    });

    it("ユーザーネームが表示される", () => {
        expect(wrapper.find("#username").text()).toBe(`@${author}`);
    });
});

describe("メソッド関連", () => {
    it(".articleをクリックしたらpush()が実行される", async () => {
        Test.clearSpysCalledTimes();
        await wrapper.find(".article").trigger("click");
        expect(spyPush).toHaveBeenCalled();
    });

    it("push(id)により/article/:idへアクセスできる", async () => {
        Test.clearSpysCalledTimes();
        const spyRouterPush = jest.spyOn(wrapper.vm.$router, "push");
        expect(spyRouterPush).not.toHaveBeenCalled();
        await wrapper.vm.push(randomStr());
        expect(spyRouterPush).toHaveBeenCalled();
    });
});

describe("Vuex", () => {
    it("ページアクセスしたらgetUserPageアクションが実行される", async done => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push(`/user/${randomStr(20)}`);
        expect(post.actions.getUserPage).toHaveBeenCalled();
        done();
    });
});
