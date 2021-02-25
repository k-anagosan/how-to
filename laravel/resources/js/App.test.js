import { mount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";

import router from "@/router.js";
import App from "@/App.vue";
import CardList from "@/pages/CardList.vue";
import Login from "@/pages/Login.vue";

describe("App.vue", () => {
    let wrapper = null;

    beforeEach(() => {
        const localVue = createLocalVue();
        localVue.use(VueRouter);

        wrapper = mount(App, {
            localVue,
            router,
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("/にアクセスしたらCardListを表示する", async () => {
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

    it("正規のuriでなければ何も表示しない", async () => {
        const [MaxLength, radix] = [-12, 36];
        const length = Math.floor(Math.random() * MaxLength);
        const uri = Math.random().toString(radix).slice(length);

        await wrapper.vm.$router.push(`/${uri}`).catch(err => {
            console.log(err);
        });
        expect(wrapper.findComponent(Login).exists()).toBe(false);
        expect(wrapper.findComponent(CardList).exists()).toBe(false);
    });
});
