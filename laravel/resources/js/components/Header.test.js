import TestUtils from "@/testutils";
import Header from "@/components/Header.vue";

const Test = new TestUtils();

let wrapper = null;
let isAuthenticated = null;
let username = null;

const setVuex = isAuth => {
    isAuthenticated = jest.fn().mockImplementation(() => isAuth);
    username = jest.fn().mockImplementation(() => "testuser");
    Test.setSpys({ isAuthenticated, username });

    Test.setVuex({
        auth: {
            namespaced: true,
            getters: {
                username,
                isAuthenticated,
            },
        },
    });
};

beforeEach(() => {
    Test.setMountOption(Header, {});
    Test.setVueRouter();
});

afterEach(() => {
    isAuthenticated = null;
    username = null;
    Test.clearSpysCalledTimes();
});

describe("Header.vue のRouterLink", () => {
    const checkIsAccessedByClick = async (to, target) => {
        expect(wrapper.vm.$route.path).not.toBe(to);
        await wrapper.find(target).trigger("click");
        expect(wrapper.vm.$route.path).toBe(to);
    };

    it.each([
        ["'Login / Register'", "/login", false, "a.login-link"],
        ["'Edit Button'", "/edit", true, "a.edit-button"],
    ])("%sをクリックしたら'%s'にアクセスされる", async (_, path, isAuth, target) => {
        setVuex(isAuth);
        wrapper = Test.wrapperFactory();
        await checkIsAccessedByClick(path, target);
    });
});

describe("Header.vueのナビゲーション", () => {
    it.each([
        ["ログインしてないとき", "ログイン/登録リンク", false, false],
        ["ログイン中", "ユーザー名とEditボタン", true, false],
        ["ログイン中", "ナビゲーションに正しいユーザー名", true, true],
    ])("%sは$sが表示される", (_, __, isAuth, checkNavi) => {
        setVuex(isAuth);
        wrapper = Test.wrapperFactory();
        if (checkNavi) {
            expect(wrapper.find(".header-username").exists()).toBe(true);
            expect(wrapper.find(".header-username").text()).toBe("testuser");
        } else {
            expect(wrapper.find(".submit-button").exists()).toBe(isAuth);
            expect(wrapper.find(".header-username").exists()).toBe(isAuth);
            expect(wrapper.find(".login-link").exists()).toBe(!isAuth);
        }
    });
});
