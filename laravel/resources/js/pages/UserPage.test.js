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
const spyFetchUserId = jest.spyOn(UserPage.methods, "fetchUserId");
Test.setSpys({ spyFetchUserId });

const author = randomStr();
const user_id = 1;
const current_page = 1;

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
        actions: { getUserId: jest.fn().mockImplementation(() => user_id) },
    };

    Test.setSpys({ getUserId: userpage.actions.getUserId });

    Test.setVueRouter();
    Test.setVuex({ auth, userpage });

    const options = {
        propsData: { page: current_page, name: author },
        stubs: ["ion-icon", "Spinner"],
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(UserPage, options);
    wrapper = Test.shallowWrapperFactory();
    expect(spyFetchUserId).toHaveBeenCalled();
    expect(userpage.actions.getUserId).toHaveBeenCalled();
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
    ])("name === usernameが%sなら.archivesを表示%s", match => {
        if (!match) {
            auth.state.user.name = randomStr();
            Test.setVuex({ auth, userpage });
            wrapper = Test.shallowWrapperFactory();
        }

        expect(wrapper.find(".archives").exists()).toBe(match);
    });

    it("ユーザーネームが表示される", () => {
        expect(wrapper.find("#username").text()).toBe(`@${author}`);
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
    it("ページアクセスしたらgetUserIdアクションが実行される", async done => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push(`/user/${randomStr(20)}`);
        expect(userpage.actions.getUserId).toHaveBeenCalled();
        done();
    });

    it("usernameを正しく算出している", () => {
        expect(Test.computedValue("username", { $store: wrapper.vm.$store })).toBe(auth.state.user.name);
    });
});
