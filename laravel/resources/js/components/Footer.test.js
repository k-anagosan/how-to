import Vuex from "vuex";
import VueRouter from "vue-router";

import {
    mount,
    shallowMount,
    createLocalVue,
    RouterLinkStub,
} from "@vue/test-utils";

import Footer from "@/components/Footer.vue";

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueRouter);

const authStoreMock = {
    namespaced: true,
    actions: {
        logout: jest.fn(),
    },
    getters: {
        isAuthenticated: jest.fn().mockImplementation(() => true),
    },
    state: {
        apiIsSuccess: true,
    },
    mutations: {
        setApiIsSuccess: (state, apiIsSuccess) => {
            state.apiIsSuccess = apiIsSuccess;
        },
    },
};

const router = new VueRouter({
    mode: "history",
    routes: [{ path: "/login" }],
});

describe("Footer.vue のRouterLink", () => {
    let wrapper = null;

    beforeEach(() => {
        authStoreMock.getters.isAuthenticated = jest.fn(() => false);
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        wrapper = mount(Footer, {
            router,
            localVue,
            store,
        });
    });

    afterEach(() => {
        authStoreMock.getters.isAuthenticated = jest.fn(() => true);
        wrapper.destroy();
    });

    it("'Login / Register'をクリックしたら'/login'にアクセスされる", async () => {
        expect(wrapper.vm.$route.path).not.toBe("/login");
        await wrapper.find("a").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/login");
    });
});

describe("Footer.vueのauthストア", () => {
    let wrapper = null;
    let spyPush = null;

    beforeEach(async () => {
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        wrapper = shallowMount(Footer, {
            store,
            localVue,
            router,
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });

        spyPush = jest.spyOn(wrapper.vm.$router, "push");

        await wrapper.vm.$router.push("/login").catch(() => {});
        spyPush.mock.calls = [];
    });

    afterEach(() => {
        wrapper.destroy();
        authStoreMock.actions.logout.mock.calls = [];
    });

    it("'logout'がクリックされたら'auth/logout'アクションが実行される", async () => {
        await wrapper.find("button").trigger("click");
        expect(authStoreMock.actions.logout).toHaveBeenCalled();
    });

    it("'auth/logout'アクションが実行された後、'/'へリダイレクト", async () => {
        expect(wrapper.vm.$route.path).toBe("/login");
        expect(authStoreMock.actions.logout).not.toHaveBeenCalled();

        await wrapper.find("button").trigger("click");
        expect(authStoreMock.actions.logout).toHaveBeenCalled();
        expect(wrapper.vm.$route.path).toBe("/");
    });

    it("'auth/logout'アクションが実行された場所が'/'であれば$router.push('/')が実行されない", async () => {
        await wrapper.vm.$router.push("/");
        expect(wrapper.vm.$route.path).toBe("/");
        expect(spyPush).toHaveBeenCalledTimes(1);
        expect(authStoreMock.actions.logout).not.toHaveBeenCalled();

        await wrapper.find("button").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/");
        expect(spyPush).toHaveBeenCalledTimes(1);
        expect(authStoreMock.actions.logout).toHaveBeenCalled();
    });

    it("'auth/logout'アクションが失敗したら$router.push('/')が実行されない", async () => {
        wrapper.vm.$store.commit("auth/setApiIsSuccess", false);
        expect(wrapper.vm.$store.state.auth.apiIsSuccess).toBe(false);

        expect(wrapper.vm.$route.path).toBe("/login");
        expect(authStoreMock.actions.logout).not.toHaveBeenCalled();

        await wrapper.find("button").trigger("click");
        expect(authStoreMock.actions.logout).toHaveBeenCalled();
        expect(wrapper.vm.$route.path).toBe("/login");
    });
});

describe("Footer.vue v-if", () => {
    let wrapper = null;

    afterEach(() => {
        authStoreMock.getters.isAuthenticated = jest.fn(() => true);
    });

    it("ログインしてないときはログイン/登録リンクのみが表示", () => {
        authStoreMock.getters.isAuthenticated = jest.fn(() => false);
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        wrapper = shallowMount(Footer, {
            store,
            localVue,
            router,
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
        expect(wrapper.find("button").exists()).toBe(false);
        expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(true);
    });

    it("ログイン中はログアウトボタンのみが表示", () => {
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        wrapper = shallowMount(Footer, {
            store,
            localVue,
            router,
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
        expect(wrapper.find("button").exists()).toBe(true);
        expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false);
    });
});
