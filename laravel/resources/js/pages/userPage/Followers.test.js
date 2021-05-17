import TestUtils from "@/testutils";
import Followers from "@/pages/userPage/Followers.vue";
import { randomStr } from "../../utils";

const Test = new TestUtils();
const spyPush = jest.spyOn(Followers.methods, "push");
const spyFetchFollowerList = jest.spyOn(Followers.methods, "fetchFollowerList");
const spySetData = jest.spyOn(Followers.methods, "setData");
const spyOnFollow = jest.spyOn(Followers.methods, "onFollow");
const spyRefreshFollowedByMe = jest.spyOn(Followers.methods, "refreshFollowedByMe");
Test.setSpys({ spyPush, spyFetchFollowerList, spySetData, spyOnFollow, spyRefreshFollowedByMe });

const username = randomStr();

const follower = () => ({
    id: Math.floor(Math.random() * 1000),
    name: randomStr(),
    followed_by_me: false,
});
const responseFactory = (current_page, per_page, last_page) => ({
    current_page,
    data: [...Array(per_page)].map(follower),
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
    auth = {
        namespaced: true,
        state: {
            user: { name: username },
        },
        getters: {
            username: state => (state.user ? state.user.name : ""),
        },
    };
    userpage = {
        namespaced: true,
        state: { followers: null },
        mutations: {
            setFollowers(state, followers) {
                state.followers = followers;
            },
        },
        actions: {
            getFollowerList: jest.fn().mockImplementation(context => {
                context.commit("setFollowers", response);
            }),
        },
    };

    const router = Test.setVueRouter();
    const store = Test.setVuex({ userpage, auth });
    spyDispatch = jest.spyOn(store, "dispatch");
    spyRouterPush = jest.spyOn(router, "push");

    Test.setSpys({ getFollowers: userpage.actions.getFollowerList, spyDispatch, spyRouterPush });
    const options = {
        propsData: { page: current_page, username },
    };

    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(Followers, options);
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

    it("pageData.length === 0がtrueならまだフォローしているユーザーがいないメッセージを表示する", async () => {
        await wrapper.setData({ pageData: [] });
        expect(wrapper.find("h1").text()).toBe("まだ他のユーザーをフォローしていません");
    });

    it("pageData.length > 0がtrueならフォローしているユーザーを表示する", () => {
        expect(wrapper.findAll(".follower").wrappers.length).toBeTruthy();
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
        expect(wrapper.find("#followers").exists()).toBe(!isShown);
    });

    it("pageDataのデータをもとにユーザーへのリンクが正しく表示される", () => {
        wrapper.findAll(".follower").wrappers.forEach((wrapper, index) => {
            const follower = response.data[index];
            expect(wrapper.find("h2").text()).toBe(follower.name);
            expect(wrapper.find("followbutton-stub").props().isFollowing).toBe(follower.followed_by_me);
        });
    });

    it("paginationのデータをPaginationコンポーネントに渡せる", () => {
        expect(wrapper.find("pagination-stub").props().pagination).toEqual(wrapper.vm.$data.pagination);
        expect(wrapper.find("pagination-stub").props().to).toEqual(`/user/${wrapper.vm.username}/followers`);
    });
});

describe("メソッド関連", () => {
    it.each([
        ["fetchFollowerList", spyFetchFollowerList],
        ["setData", spySetData],
    ])("ページアクセスしたら%sが実行される", (_, spy) => {
        expect(spy).toHaveBeenCalled();
    });

    it("すでにfollowerListがあり、followerList.current_pageとpageが同じならfetchFollowerList()が実行されない", async () => {
        Test.clearSpysCalledTimes();
        await wrapper.vm.$router.push("/user/xxx/followers");
        expect(spyFetchFollowerList).not.toHaveBeenCalled();
    });

    it("フォロワーリンクをクリックしたらpush()が実行される", () => {
        wrapper.findAll(".follower").wrappers.forEach((wrapper, index) => {
            expect(spyPush).not.toHaveBeenCalled();
            wrapper.trigger("click");
            expect(spyPush).toHaveBeenCalled();
            expect(spyPush.mock.calls[0]).toEqual([response.data[index].name]);
            spyPush.mock.calls = [];
        });
    });

    it("push()を実行したらrouter.push()が実行される", () => {
        const name = randomStr();
        expect(spyRouterPush).not.toHaveBeenCalled();
        wrapper.vm.push(name);
        expect(spyRouterPush).toHaveBeenCalled();
        expect(spyRouterPush.mock.calls[0][0]).toBe(`/user/${name}`);
    });

    it("FollowButtonでfollowイベントが発火されたらonFollow()が実行される", async () => {
        await wrapper.setData({ loading: false });

        expect(spyOnFollow).not.toHaveBeenCalled();
        wrapper.findAll("followbutton-stub").wrappers.forEach((wrapper, index) => {
            wrapper.vm.$emit("follow", { isFollowing: true });
            expect(spyOnFollow).toHaveBeenCalled();
            expect(spyOnFollow.mock.calls[index]).toEqual([{ isFollowing: true }, response.data[index].id]);
        });
    });

    it("onFollow()が実行されたらfollowイベントが発火される", () => {
        expect(wrapper.emitted().follow).toBeUndefined();
        wrapper.vm.onFollow({ isFollowing: true }, 1);
        expect(wrapper.emitted().follow).toEqual([[{ id: 1, isFollowing: true }]]);
    });

    it("onFollow()が実行されたらrefreshFollowedByMe()が実行される", () => {
        expect(spyRefreshFollowedByMe).not.toHaveBeenCalled();
        wrapper.vm.onFollow({ isFollowing: true }, 1);
        expect(spyRefreshFollowedByMe).toHaveBeenCalled();
    });

    it("refreshFollowedByMe()が実行されたらstate.userpage.followersが更新される", () => {
        const id = response.data[0].id;
        userpage.state.followers.data.forEach(data => {
            expect(data.followed_by_me).toBe(false);
        });
        wrapper.vm.refreshFollowedByMe(true, id);
        userpage.state.followers.data.forEach((data, index) => {
            expect(data.followed_by_me).toBe(index === 0);
        });
    });
});

describe("Vuex関連", () => {
    it("ページアクセスしたらgetFollowerListアクションが実行される", () => {
        const payload = { name: username, page: current_page };
        expect(userpage.actions.getFollowerList).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch.mock.calls[0][1]).toEqual(payload);
    });

    it("followerListが変更されたらgetFollowerListアクションが実行される", () => {
        const payload = { name: username, page: current_page };
        wrapper.vm.$store.commit("userpage/setFollowers", null, { root: true });
        expect(userpage.actions.getFollowerList).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch.mock.calls[0][1]).toEqual(payload);
    });

    it("followerListを正しく算出している", () => {
        expect(Test.computedValue("followerList", { $store: wrapper.vm.$store })).toEqual(userpage.state.followers);
    });
    it("loginUsernameを正しく算出している", () => {
        expect(Test.computedValue("loginUsername", { $store: wrapper.vm.$store })).toEqual(auth.state.user.name);
    });
});
