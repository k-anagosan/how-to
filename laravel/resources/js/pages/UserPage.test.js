import TestUtils from "@/testutils";
import UserPage from "@/pages/UserPage.vue";
import { randomStr } from "../utils";

import Articles from "@/pages/userPage/Articles.vue";
import Archives from "@/pages/userPage/Archives.vue";
import Followers from "@/pages/userPage/Followers.vue";
import Likes from "@/pages/userPage/Likes.vue";

jest.mock("@/pages/userPage/Articles.vue", () => ({
    name: "Articles",
    render: h => h("h1", "Articles"),
}));
jest.mock("@/pages/userPage/Archives.vue", () => ({
    name: "Archives",
    render: h => h("h1", "Archives"),
}));
jest.mock("@/pages/userPage/Followers.vue", () => ({
    name: "Followers",
    render: h => h("h1", "Followers"),
}));
jest.mock("@/pages/userPage/Likes.vue", () => ({
    name: "Likes",
    render: h => h("h1", "Likes"),
}));

const Test = new TestUtils();
const spyFetchUserPageData = jest.spyOn(UserPage.methods, "fetchUserPageData");
const spyClearPageData = jest.spyOn(UserPage.methods, "clearPageData");
const spyClearUserData = jest.spyOn(UserPage.methods, "clearUserData");
const spyOnFollow = jest.spyOn(UserPage.methods, "onFollow");
Test.setSpys({ spyFetchUserPageData, spyClearPageData, spyClearUserData, spyOnFollow });

const author = randomStr();
const user_id = 1;
const current_page = 1;
const followed_by_me = false;

let [auth, userpage] = [null, null];
let wrapper = null;
beforeEach(() => {
    auth = {
        namespaced: true,
        state: { user: { name: author }, apiIsSuccess: true },
        mutations: {
            setUser(state, user) {
                state.user = user;
            },
        },
        getters: {
            username: state => state.user.name,
        },
        actions: {
            putFollow: jest.fn(),
            deleteFollow: jest.fn(),
        },
    };
    userpage = {
        namespaced: true,
        state: {
            articles: {},
            archives: {},
            likes: {},
            followers: {},
        },
        mutations: {
            setArticles: jest.fn().mockImplementation((state, articles) => {
                state.articles = articles;
            }),
            setArchives: jest.fn().mockImplementation((state, archives) => {
                state.archives = archives;
            }),
            setLikes: jest.fn().mockImplementation((state, likes) => {
                state.likes = likes;
            }),
            setFollowers: jest.fn().mockImplementation((state, followers) => {
                state.followers = followers;
            }),
        },
        actions: { getUserPageData: jest.fn().mockImplementation(() => ({ id: user_id, followed_by_me })) },
    };

    Test.setSpys({
        getUserPageData: userpage.actions.getUserPageData,
        putFollow: auth.actions.putFollow,
        deleteFollow: auth.actions.deleteFollow,
    });

    Test.setVueRouter();
    Test.setVuex({ auth, userpage });

    const options = {
        propsData: { page: current_page, name: author },
        stubs: ["ion-icon", "Spinner"],
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(UserPage, options);
    wrapper = Test.shallowWrapperFactory();
    expect(spyFetchUserPageData).toHaveBeenCalled();
    expect(userpage.actions.getUserPageData).toHaveBeenCalled();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("ページアクセスしたらdataにuserIdが保存される", () => {
        expect(wrapper.vm.$data.userId).toBe(user_id);
    });

    it.each([
        [true, "させる"],
        [false, "させない"],
    ])("loginUser.name === nameが%sなら.archivesを表示%s", async isShown => {
        if (!isShown) {
            auth.state.user.name = randomStr();
            Test.setVuex({ auth, userpage });
            wrapper = Test.shallowWrapperFactory();
            await wrapper.setData({ loading: false });
        }

        expect(wrapper.find(".archives").exists()).toBe(isShown);
    });

    it("loginUserがnullなら.archivesが表示されない", async () => {
        auth.state.user = null;
        Test.setVuex({ auth, userpage });
        wrapper = Test.shallowWrapperFactory();
        await wrapper.setData({ loading: false });

        expect(wrapper.find(".archives").exists()).toBe(false);
    });

    it.each([
        [true, "させる"],
        [false, "させない"],
    ])("loginUser.name !== nameが%sならFollowButtonを表示%s", async isShown => {
        if (isShown) {
            auth.state.user.name = randomStr();
            Test.setVuex({ auth, userpage });
            wrapper = Test.shallowWrapperFactory();
            await wrapper.setData({ loading: false });
        }

        expect(wrapper.find("followbutton-stub").exists()).toBe(isShown);
    });

    it("loginUserがnullならFollowButtonが表示される", async () => {
        auth.state.user = null;
        Test.setVuex({ auth, userpage });
        wrapper = Test.shallowWrapperFactory();
        await wrapper.setData({ loading: false });

        expect(wrapper.find("followbutton-stub").exists()).toBe(true);
    });

    it("ユーザーネームが表示される", () => {
        expect(wrapper.find("#username").text()).toBe(`@${author}`);
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#userpage").exists()).toBe(!isShown);
    });
});

describe("メソッド関連", () => {
    it("clearUserData()が実行されたらdataが初期化される", () => {
        wrapper.setData({ followed_by_me: true });
        expect(wrapper.vm.$data).toEqual({
            userId: user_id,
            followed_by_me: true,
            loading: expect.anything(),
        });
        wrapper.vm.clearUserData();
        expect(wrapper.vm.$data).toEqual({
            userId: null,
            followed_by_me: false,
            loading: expect.anything(),
        });
    });
    it("dataにuserIdがあればfetchUserPageData()が実行されない", async () => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push("/user/xxx");
        expect(spyFetchUserPageData).not.toHaveBeenCalled();
    });

    it("FollowButtonでfollowイベントが発火されたらonFollow()が実行される", async () => {
        auth.state.user.name = randomStr();
        Test.setVuex({ auth, userpage });
        wrapper = Test.shallowWrapperFactory();
        await wrapper.setData({ loading: false });

        expect(spyOnFollow).not.toHaveBeenCalled();
        wrapper.find("followbutton-stub").vm.$emit("follow", { isFollowing: true });
        expect(spyOnFollow).toHaveBeenCalled();
    });

    it.each([
        [true, "putFollow"],
        [false, "deleteFollow"],
    ])("onFollow()が実行されたときisFollowingが%sなら%sアクションが実行される", async isFollowing => {
        auth.state.user.name = randomStr();
        Test.setVuex({ auth, userpage });
        wrapper = Test.shallowWrapperFactory();
        await wrapper.setData({ loading: false });

        expect(auth.actions.putFollow).not.toHaveBeenCalled();
        expect(auth.actions.deleteFollow).not.toHaveBeenCalled();
        await wrapper.vm.onFollow({ isFollowing });
        if (isFollowing) {
            expect(auth.actions.putFollow).toHaveBeenCalled();
            expect(auth.actions.deleteFollow).not.toHaveBeenCalled();
        } else {
            expect(auth.actions.putFollow).not.toHaveBeenCalled();
            expect(auth.actions.deleteFollow).toHaveBeenCalled();
        }
        expect(wrapper.vm.$data.followed_by_me).toBe(isFollowing);
    });

    it.each([
        ["ある", "更新されない", 1],
        ["ない", "更新される", null],
    ])("onFollow()が実行されたときe.idが%sならthis.followed_by_meが%s", async (_, __, id) => {
        auth.state.user.name = randomStr();
        userpage.actions.getUserPageData = jest.fn().mockImplementation(() => ({ id: user_id, followed_by_me: true }));
        Test.setVuex({ auth, userpage });
        wrapper = await Test.shallowWrapperFactory();
        wrapper.setData({ loading: false });

        await wrapper.vm.onFollow({ isFollowing: false, id });
        expect(wrapper.vm.$data.followed_by_me).toBe(Boolean(id));
    });
});

describe("Vue Router関連", () => {
    let spyPush = null;
    beforeEach(() => {
        Test.setVueRouter([
            {
                path: "/user/:name",
                component: Articles,
            },
            {
                path: "/user/:name/archives",
                component: Archives,
            },
            {
                path: "/user/:name/followers",
                component: Followers,
            },
            {
                path: "/user/:name/likes",
                component: Likes,
            },
        ]);
        wrapper = Test.wrapperFactory();
        spyPush = jest.spyOn(wrapper.vm.$router, "push");
        Test.setSpys({ spyPush });
        Test.clearSpysCalledTimes();
        expect(spyPush).not.toHaveBeenCalled();
    });

    afterEach(() => {
        Test.clearSpysCalledTimes();
        if (wrapper.vm.$route.path !== "/") wrapper.vm.$router.push("/");
    });

    it.each([
        [".articles", "/user/:name"],
        [".archives", "/user/:name/archives"],
        [".likes", "/user/:name/likes"],
        [".followers", "/user/:name/followers"],
    ])("%sのRouterLinkをクリックしたら%sにアクセスされる", async (className, path) => {
        const preparedPath = path.replace(/:name/, author);
        expect(wrapper.vm.$route.path).not.toBe(preparedPath);
        await wrapper.find(`${className} a`).trigger("click");
        expect(wrapper.vm.$route.path).toBe(preparedPath);
    });

    describe.each([
        ["/user/xxx", "Articles", "", Articles],
        ["/user/xxx/archives", "Archives", "/archives", Archives],
        ["/user/xxx/likes", "Likes", "/likes", Likes],
        ["/user/xxx/followers", "Followers", "/followers", Followers],
    ])("/user/xxx アクセス結果", (fullPath, ComponentName, path, Component) => {
        it(`${fullPath}にアクセスしたら${ComponentName}が表示される`, async () => {
            if (path === "/archives") wrapper.vm.$store.commit("auth/setUser", author);
            await Test.testRoutingWithComponent("/", `/user/${author}${path}`, Component);
        });

        it(`${fullPath}にアクセスしたらリンクにactiveクラスが付加される`, async () => {
            if (path === "/archives") wrapper.vm.$store.commit("auth/setUser", { name: author });
            await wrapper.vm.$router.push(`/user/${author}${path}`);
            expect(wrapper.find(`.${ComponentName.toLowerCase()} .active`).exists()).toBe(true);
        });
    });

    it("beforeRouteLeave()実行時にclearPageData()が実行される", () => {
        expect(spyClearPageData).not.toHaveBeenCalled();
        UserPage.beforeRouteLeave.call(wrapper.vm, null, null, jest.fn());
        expect(spyClearPageData).toHaveBeenCalled();
    });

    describe.each([
        [true, "実行されない", { params: { name: "equal" } }, { params: { name: "equal" } }],
        [false, "実行される", { params: { name: "notEqual" } }, { params: { name: "not-equal" } }],
    ])("beforeRouteUpdate()実行時", (isEqual, describe, to, from) => {
        it(`to.params.name !== from.params.nameが${isEqual}ならclearPageData()とclearUserData()が${describe}`, () => {
            expect(spyClearPageData).not.toHaveBeenCalled();
            expect(spyClearUserData).not.toHaveBeenCalled();
            UserPage.beforeRouteUpdate.call(wrapper.vm, to, from, jest.fn());
            if (isEqual) {
                expect(spyClearPageData).not.toHaveBeenCalled();
                expect(spyClearUserData).not.toHaveBeenCalled();
            } else {
                expect(spyClearPageData).toHaveBeenCalled();
                expect(spyClearUserData).toHaveBeenCalled();
            }
        });
    });
});

describe("Vuex関連", () => {
    it("ページアクセスしたらgetUserPageDataアクションが実行される", async done => {
        Test.clearSpysCalledTimes();
        wrapper.setData({ userId: null });
        await wrapper.vm.$router.push(`/user/${randomStr(20)}`);
        expect(userpage.actions.getUserPageData).toHaveBeenCalled();
        done();
    });

    it("usernameを正しく算出している", () => {
        expect(Test.computedValue("loginUser", { $store: wrapper.vm.$store })).toBe(auth.state.user);
    });

    it("clearPageData()を実行したらuserpageのstateが初期化される", () => {
        wrapper.vm.clearPageData();
        Object.keys(userpage.mutations).forEach(key => {
            expect(userpage.mutations[key]).toHaveBeenCalled();
        });
        Object.keys(wrapper.vm.$store.state.userpage).forEach(key => {
            expect(wrapper.vm.$store.state.userpage[key]).toBe(null);
        });
    });
});
