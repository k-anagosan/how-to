import Vuex from "vuex";
import VueRouter from "vue-router";

import {
    mount,
    shallowMount,
    createLocalVue,
    RouterLinkStub,
} from "@vue/test-utils";

import Header from "@/components/Header.vue";

describe("Header.vue のRouterLink", () => {
    const localVue = createLocalVue();
    let wrapper = null;

    beforeEach(() => {
        localVue.use(Vuex);
        localVue.use(VueRouter);
        const isAuthenticated = jest.fn().mockImplementation(() => false);

        const authStoreMock = {
            namespaced: true,
            getters: {
                isAuthenticated,
            },
        };
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        const router = new VueRouter({
            mode: "history",
            routes: [{ path: "/login" }],
        });

        wrapper = mount(Header, {
            store,
            router,
            localVue,
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("'Login / Register'をクリックしたら'/login'にアクセスされる", async () => {
        expect(wrapper.vm.$route.path).not.toBe("/login");
        await wrapper.find("a.login-link").trigger("click");
        expect(wrapper.vm.$route.path).toBe("/login");
    });
});

describe("Header.vueのナビゲーション", () => {
    const localVue = createLocalVue();
    let wrapper = null;
    const isAuthenticated = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
    const username = jest.fn().mockImplementation(() => "testuser");

    beforeEach(() => {
        localVue.use(Vuex);

        const authStoreMock = {
            namespaced: true,
            getters: {
                isAuthenticated,
                username,
            },
        };
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });

        wrapper = shallowMount(Header, {
            store,
            localVue,
            stubs: {
                RouterLink: RouterLinkStub,
            },
        });
    });

    it("ログインしてないときはログイン/登録リンクのみを表示", () => {
        expect(wrapper.find(".submit-button").exists()).toBe(false);
        expect(wrapper.find(".header-username").exists()).toBe(false);
        expect(wrapper.find(".login-link").exists()).toBe(true);
    });

    it("ログイン中はユーザー名とSubmitボタンを表示", () => {
        expect(wrapper.find(".submit-button").exists()).toBe(true);
        expect(wrapper.find(".header-username").exists()).toBe(true);
        expect(wrapper.find(".login-link").exists()).toBe(false);
    });

    it("ナビゲーションに正しいユーザー名が表示される", () => {
        expect(wrapper.find(".header-username").exists()).toBe(true);
        expect(wrapper.find(".header-username").text()).toBe("testuser");
    });
});
