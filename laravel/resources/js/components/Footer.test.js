import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";

import Footer from "@/components/Footer.vue";

const Test = new TestUtils();
const logout = jest.fn();
Test.setSpys({ logout });

const setVuex = isAuth => {
    const setApiIsSuccess = (state, apiIsSuccess) => {
        state.apiIsSuccess = apiIsSuccess;
    };
    const isAuthenticated = () => isAuth;
    Test.setVuex({
        auth: {
            namespaced: true,
            actions: { logout },
            getters: { isAuthenticated },
            state: { apiIsSuccess: true },
            mutations: { setApiIsSuccess },
        },
    });
};

let wrapper = null;

beforeEach(() => {
    Test.setMountOption(Footer, {});
    Test.setVueRouter();
});

afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper.destroy();
});

const checkIsAccessedByClick = async (to, target) => {
    expect(wrapper.vm.$route.path).not.toBe(to);
    await wrapper.find(target).trigger("click");
    expect(wrapper.vm.$route.path).toBe(to);
};

describe("Footer.vue のRouterLink", () => {
    it("'Login / Register'をクリックしたら'/login'にアクセスされる", async done => {
        setVuex(false);
        wrapper = Test.wrapperFactory();
        await checkIsAccessedByClick("/login", "a");
        done();
    });
});

describe("Footer.vueのauthストア", () => {
    let spyPush = null;

    const checkSpyIsCalled = async (to, target) => {
        Test.clearSpysCalledTimes();

        expect(spyPush).not.toHaveBeenCalled();
        expect(logout).not.toHaveBeenCalled();

        await wrapper.find(target).trigger("click");
        expect(wrapper.vm.$route.path).toBe(to);
        expect(spyPush).not.toHaveBeenCalled();
        expect(logout).toHaveBeenCalled();
    };

    beforeEach(async () => {
        Test.setMountOption(Footer, {
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
        setVuex(true);
        wrapper = Test.shallowWrapperFactory();

        spyPush = jest.spyOn(wrapper.vm.$router, "push");
        Test.setSpys({ spyPush });

        await wrapper.vm.$router.push("/login").catch(() => {});
        expect(wrapper.vm.$route.path).toBe("/login");
        Test.clearSpysCalledTimes();
    });

    it("'logout'がクリックされたら'auth/logout'アクションが実行される", async done => {
        await wrapper.find("button").trigger("click");
        expect(logout).toHaveBeenCalled();
        done();
    });

    it("'auth/logout'アクションが実行された後、'/'へリダイレクト", async done => {
        expect(logout).not.toHaveBeenCalled();
        await checkIsAccessedByClick("/", "button");
        expect(logout).toHaveBeenCalled();
        done();
    });

    it("'auth/logout'アクションが実行された場所が'/'であれば$router.push('/')が実行されない", async done => {
        await wrapper.vm.$router.push("/");
        expect(wrapper.vm.$route.path).toBe("/");
        await checkSpyIsCalled("/", "button");
        done();
    });

    it("'auth/logout'アクションが失敗したら$router.push('/')が実行されない", async done => {
        wrapper.vm.$store.commit("auth/setApiIsSuccess", false);
        expect(wrapper.vm.$store.state.auth.apiIsSuccess).toBe(false);
        await checkSpyIsCalled("/login", "button");
        done();
    });
});

describe("Footer.vue v-if", () => {
    const testShowing = isAuth => {
        expect(wrapper.find("button").exists()).toBe(isAuth);
        expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(!isAuth);
    };

    beforeEach(() => {
        Test.setMountOption(Footer, {
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
    });
    it("ログインしてないときはログイン/登録リンクのみが表示", () => {
        setVuex(false);
        wrapper = Test.shallowWrapperFactory();
        testShowing(false);
    });

    it("ログイン中はログアウトボタンのみが表示", () => {
        setVuex(true);
        wrapper = Test.shallowWrapperFactory();
        testShowing(true);
    });
});
