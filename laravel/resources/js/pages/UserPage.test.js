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
const spyClearUserPage = jest.spyOn(UserPage.methods, "clearUserPage");
Test.setSpys({ spyFetchUserPageData, spyClearUserPage });

const author = randomStr();
const user_id = 1;
const current_page = 1;
const followed_by_me = false;

let [auth, userpage] = [null, null];
let wrapper = null;
beforeEach(() => {
    auth = {
        namespaced: true,
        state: { user: { name: author } },
        mutations: {
            setUser(state, user) {
                state.user = user;
            },
        },
        getters: {
            username: state => state.user.name,
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

    Test.setSpys({ getUserPageData: userpage.actions.getUserPageData });

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
    ])("loginUser.name === nameが%sなら.archivesを表示%s", isShown => {
        if (!isShown) {
            auth.state.user.name = randomStr();
            Test.setVuex({ auth, userpage });
            wrapper = Test.shallowWrapperFactory();
        }

        expect(wrapper.find(".archives").exists()).toBe(isShown);
    });

    it("loginUserがnullなら.archivesが表示されない", () => {
        auth.state.user = null;
        Test.setVuex({ auth, userpage });
        wrapper = Test.shallowWrapperFactory();

        expect(wrapper.find(".archives").exists()).toBe(false);
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
    it("dataにuserIdがあればfetchUserId()が実行されない", async () => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push("/user/xxx");
        expect(spyFetchUserPageData).not.toHaveBeenCalled();
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
        ["/user/xxxにアクセスしたらArticlesが表示される", "/", Articles],
        ["/user/xxx/archivesにアクセスしたらArchivesが表示される", "/archives", Archives],
        ["/user/xxx/likesにアクセスしたらLikesが表示される", "/likes", Likes],
        ["/user/xxx/followersにアクセスしたらFollowersが表示される", "/followers", Followers],
    ])("/user/xxx アクセス結果", (describe, path, Component) => {
        it(`${describe}`, async () => {
            if (path === "/archives") wrapper.vm.$store.commit("auth/setUser", author);
            await Test.testRoutingWithComponent("/", `/user/${author}${path}`, Component);
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

    it("clearUserPage()を実行したらuserpageのstateが初期化される", () => {
        wrapper.vm.clearUserPage();
        Object.keys(userpage.mutations).forEach(key => {
            expect(userpage.mutations[key]).toHaveBeenCalled();
        });
        Object.keys(wrapper.vm.$store.state.userpage).forEach(key => {
            expect(wrapper.vm.$store.state.userpage[key]).toBe(null);
        });
    });
});
