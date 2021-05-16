import TestUtils from "@/testutils";
import FollowButton from "@/components/FollowButton.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();

Test.setMountOption(FollowButton, {});

const username = randomStr();
let wrapper = null;
let propsData = {};
let auth = null;
beforeEach(() => {
    Test.setMountOption(FollowButton, { propsData });

    auth = {
        namespaced: true,
        state: { user: { name: username } },
        mutations: {
            setUser(state, user) {
                state.user = user;
            },
        },
        getters: {
            isAuthenticated: state => Boolean(state.user),
        },
    };

    Test.setVuex({ auth });
    Test.setVueRouter();

    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    propsData = {};
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it.each([
        [true, "Unfollow"],
        [false, "Follow"],
    ])("propsのisFollowingが%sなら<span>%s</span>が表示される", async (isFollowing, text) => {
        await wrapper.setProps({ isFollowing });
        expect(wrapper.props().isFollowing).toBe(isFollowing);
        expect(wrapper.find("span").text()).toBe(text);
    });

    it("propsのisFollowingが無ければfalseが設定される", () => {
        expect(wrapper.props().isFollowing).toBe(false);
    });
});

describe("メソッド、イベント関連", () => {
    const spyOnClick = jest.spyOn(FollowButton.methods, "onClick");
    const spyEnable = jest.spyOn(FollowButton.methods, "enable");
    beforeEach(() => {
        Test.setSpys({ spyOnClick, spyEnable });
    });

    afterEach(() => {
        Test.clearSpysCalledTimes();
    });

    it("buttonクリックによりonClick()ハンドラが実行される", async () => {
        expect(spyOnClick).not.toHaveBeenCalled();
        await wrapper.find("button").trigger("click");
        expect(spyOnClick).toHaveBeenCalled();
    });

    it.each([
        ["フォロー時、", true],
        ["未フォロー時", false],
    ])("%s, onClick()実行によりfollowイベントが{isFollowing: %s}を伴って発火される", async (_, isFollowing) => {
        if (!isFollowing) {
            await wrapper.setProps({ isFollowing: !isFollowing });
        }
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isFollowing).toBe(!isFollowing);
        expect(wrapper.vm.$data.disabled).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        expect(wrapper.emitted().follow).toEqual([[{ isFollowing }]]);
        expect(wrapper.vm.$data.disabled).toBe(true);
    });

    it.each([
        ["ログイン時", "発火される", true],
        ["未ログイン時", "発火されずに$router.push()が実行される", false],
    ])("%sであれば, onClick()実行によりイベントが", async (_, auth) => {
        const spyRouterPush = jest.spyOn(wrapper.vm.$router, "push").mockImplementation(() => {});
        if (!auth) {
            wrapper.vm.$store.commit("auth/setUser", null, { root: true });
        }
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(spyRouterPush).not.toHaveBeenCalled();
        await wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        if (auth) {
            expect(spyRouterPush).not.toHaveBeenCalled();
            expect(wrapper.emitted().follow).toEqual([[{ isFollowing: true }]]);
        } else {
            expect(spyRouterPush.mock.calls[0][0]).toBe("/login");
        }
        spyRouterPush.mockRestore();
    });

    it.each([
        [false, "できる"],
        [true, "できない"],
    ])("dataのdisabledが%sなら、onClick()を実行%s", async disabled => {
        await wrapper.setData({ disabled });
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isFollowing).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        if (disabled) {
            expect(wrapper.emitted().follow).toBeUndefined();
        } else {
            expect(wrapper.emitted().follow).toEqual([[{ isFollowing: true }]]);
        }
    });

    it("onClick()実行時、setTimeout()により指定時間後にenable()が実行される", async done => {
        await wrapper.setData({ disabled: false });
        expect(spyEnable).not.toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(false);
        await wrapper.vm.onClick();
        setTimeout(() => {
            expect(spyEnable).toHaveBeenCalled();
            expect(wrapper.vm.$data.disabled).toBe(false);
            done();
        }, 1000);
    });

    it("enable()が実行されればdisabledにfalseが代入される", async done => {
        await wrapper.setData({ disabled: true });
        expect(spyEnable).not.toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(true);
        wrapper.vm.enable();
        expect(spyEnable).toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(false);
        done();
    });
});

describe("vuex 関連", () => {
    it("authを算出できる", () => {
        expect(Test.computedValue("auth", { $store: wrapper.vm.$store })).toBe(true);
    });
});
