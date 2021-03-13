import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import router from "@/router";

import Vuex from "vuex";
import store from "@/store/index";

import App from "@/App.vue";
import CardList from "@/pages/CardList.vue";
import Login from "@/pages/Login.vue";

import { randomStr } from "./utils";

describe("App.vue", () => {
    let wrapper = null;
    const localVue = createLocalVue();
    localVue.use(VueRouter);
    localVue.use(Vuex);

    beforeEach(() => {
        wrapper = mount(App, {
            localVue,
            router,
            store,
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("/にアクセスしたらCardListを表示する", async () => {
        const uri = randomStr();
        await wrapper.vm.$router.push(`/${uri}`).catch(err => {
            console.log(err);
        });
        await wrapper.vm.$router.push("/").catch(err => {
            console.log(err);
        });
        expect(wrapper.findComponent(CardList).exists()).toBe(true);
    });

    it("/loginにアクセスしたらLoginを表示する", async () => {
        await wrapper.vm.$router.push("/login").catch(err => {
            console.log(err);
        });
        expect(wrapper.findComponent(Login).exists()).toBe(true);
    });

    it("ログイン中に/loginにアクセスしたら/にリダイレクトされる", async () => {
        const store = {
            getters: {
                "auth/isAuthenticated": true,
            },
        };

        const routes = [
            {
                path: "/login",
                beforeEnter(to, from, next) {
                    if (store.getters["auth/isAuthenticated"]) {
                        next("/");
                    } else {
                        next();
                    }
                },
            },
        ];

        const router = new VueRouter({
            mode: "history",
            routes,
        });

        wrapper = shallowMount(App, {
            localVue,
            router,
            mocks: {
                store,
            },
        });

        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$router.push("/login").catch(() => {});

        expect(wrapper.vm.$route.path).toBe("/");
    });

    it("正規のuriでなければ何も表示しない", async () => {
        const uri = randomStr();

        await wrapper.vm.$router.push(`/${uri}`).catch(err => {
            console.log(err);
        });
        expect(wrapper.findComponent(Login).exists()).toBe(false);
        expect(wrapper.findComponent(CardList).exists()).toBe(false);
    });
});
