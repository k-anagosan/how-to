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

    it("'Login / Register'をクリックしたら'/login'にアクセスされる", async done => {
        setVuex(false);
        wrapper = Test.wrapperFactory();
        await checkIsAccessedByClick("/login", "a.login-link");
        done();
    });

    it("'Edit Button'をクリックしたら'/edit'にアクセスされる", async done => {
        setVuex(true);
        wrapper = Test.wrapperFactory();
        await checkIsAccessedByClick("/edit", "a.edit-button");
        done();
    });
});

describe("Header.vueのナビゲーション", () => {
    it("ログインしてないときはログイン/登録リンクのみを表示", () => {
        setVuex(false);
        wrapper = Test.wrapperFactory();
        expect(wrapper.find(".submit-button").exists()).toBe(false);
        expect(wrapper.find(".header-username").exists()).toBe(false);
        expect(wrapper.find(".login-link").exists()).toBe(true);
    });

    it("ログイン中はユーザー名とEditボタンを表示", () => {
        setVuex(true);
        wrapper = Test.wrapperFactory();
        expect(wrapper.find(".submit-button").exists()).toBe(true);
        expect(wrapper.find(".header-username").exists()).toBe(true);
        expect(wrapper.find(".login-link").exists()).toBe(false);
    });

    it("ナビゲーションに正しいユーザー名が表示される", () => {
        setVuex(true);
        wrapper = Test.wrapperFactory();
        expect(wrapper.find(".header-username").exists()).toBe(true);
        expect(wrapper.find(".header-username").text()).toBe("testuser");
    });
});
