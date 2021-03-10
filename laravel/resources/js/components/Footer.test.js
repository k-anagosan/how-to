import Vuex from "vuex";
import VueRouter from "vue-router";

import {
    mount,
    shallowMount,
    createLocalVue,
    RouterLinkStub,
} from "@vue/test-utils";

import Footer from "@/components/Footer.vue";

describe("Footer.vue のRouterLink", () => {
    const localVue = createLocalVue();
    localVue.use(VueRouter);
    let wrapper = null;

    beforeEach(() => {
        const router = new VueRouter({
            mode: "history",
            routes: [{ path: "/login" }],
        });

        const $store = {
            getters: {},
        };

        wrapper = mount(Footer, {
            router,
            localVue,
            mocks: {
                $store,
            },
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("'Login / Register'をクリックしたら'/login'にアクセスされる", async () => {
        expect(wrapper.vm.$route.path).not.toBe("/login");
        await wrapper.find("a").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/login");
    });
});

describe("Footer.vueのauthストア", () => {
    const localVue = createLocalVue();
    let authStoreMock = null;
    let wrapper = null;

    beforeEach(async () => {
        localVue.use(Vuex);
        authStoreMock = {
            namespaced: true,
            actions: {
                logout: jest.fn(),
            },
            getters: {
                isAuthenticated: jest.fn().mockImplementation(() => true),
            },
        };
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        const $route = {
            path: "/login",
        };
        const $router = {
            push: jest.fn().mockImplementation(url => {
                $route.path = url;
            }),
        };

        wrapper = shallowMount(Footer, {
            store,
            localVue,
            mocks: {
                $router,
                $route,
            },
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
        await wrapper.vm.$router.push("/login");
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("'logout'がクリックされたら'auth/logout'アクションが実行される", async () => {
        await wrapper.find("button").trigger("click");
        expect(authStoreMock.actions.logout).toHaveBeenCalled();
    });

    it("'auth/logout'アクションが実行された後、'/'へリダイレクト", async () => {
        expect(wrapper.vm.$route.path).toBe("/login");
        await wrapper.find("button").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/");
    });

    it("'auth/logout'アクションが実行された場所が'/'であれば$router.push('/')が実行されない", async () => {
        await wrapper.vm.$router.push("/");
        expect(wrapper.vm.$route.path).toBe("/");
        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(2);

        await wrapper.find("button").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/");
        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(2);
    });
});
