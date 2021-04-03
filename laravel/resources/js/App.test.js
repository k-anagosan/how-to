import { mount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import router from "@/router";

import Vuex from "vuex";
import store from "@/store/index";

import App from "@/App.vue";
import CardList from "@/pages/CardList.vue";
import Login from "@/pages/Login.vue";
import Edit from "@/pages/Edit.vue";

import { randomStr, INTERNAL_SERVER_ERROR } from "./utils";

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
            stubs: {
                "ion-icon": true,
            },
        });
    });

    afterEach(() => {
        wrapper.destroy();
        wrapper.vm.$router.push("/").catch(() => {});
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
        wrapper.vm.$store.commit("auth/setUser", true);

        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$router.push("/login").catch(() => {});

        expect(wrapper.vm.$route.path).toBe("/");
    });

    it("ログイン中に/editにアクセスしたらEditを表示する", async () => {
        wrapper.vm.$store.commit("auth/setUser", true);

        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$router.push("/edit").catch(() => {});

        expect(wrapper.findComponent(Edit).exists()).toBe(true);
    });

    it("未認証中に/editにアクセスしたら/にリダイレクトされる", async () => {
        wrapper.vm.$store.commit("auth/setUser", null);

        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$router.push("/edit").catch(() => {});

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

    it("ステータスコード500が確認されたら/500にリダイレクト", async () => {
        expect(wrapper.vm.$route.path).toBe("/");

        await wrapper.vm.$store.commit(
            "error/setErrorCode",
            INTERNAL_SERVER_ERROR
        );

        expect(wrapper.vm.$route.path).toBe("/500");
    });
});
