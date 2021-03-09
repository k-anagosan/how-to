import Vuex from "vuex";
import VueRouter from "vue-router";

import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import Login from "@/pages/Login.vue";

import { randomStr } from "../utils.js";

describe("Login.vue", () => {
    const wrapper = mount(Login);
    it("#login-tabをクリックしたらログインフォームが表示される", async () => {
        await wrapper.find("#login-tab").trigger("click");
        expect(wrapper.find("#login-form").isVisible()).toBe(true);
        expect(wrapper.find("#register-form").isVisible()).toBe(false);
    });

    it("#register-tabをクリックしたら登録フォームが表示される", async () => {
        await wrapper.find("#register-tab").trigger("click");
        expect(wrapper.find("#login-form").isVisible()).toBe(false);
        expect(wrapper.find("#register-form").isVisible()).toBe(true);
    });

    it("#login-formに入力した値がdataに保存される", () => {
        const data = { email: randomStr(), password: randomStr() };

        wrapper.find("#login-email").setValue(data.email);
        wrapper.find("#login-password").setValue(data.password);

        expect(wrapper.vm.$data.loginForm).toEqual({
            email: data.email,
            password: data.password,
        });
    });

    it("#register-formに入力した値がdataに保存される", () => {
        const data = {
            name: randomStr(),
            email: randomStr(),
            password: randomStr(),
            passwordConfirmation: randomStr(),
        };

        wrapper.find("#username").setValue(data.name);
        wrapper.find("#email").setValue(data.email);
        wrapper.find("#password").setValue(data.password);
        wrapper
            .find("#password-confirmation")
            .setValue(data.passwordConfirmation);

        expect(wrapper.vm.$data.registerForm).toEqual({
            name: data.name,
            email: data.email,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
        });
    });

    describe("Vuex", () => {
        const localVue = createLocalVue();

        localVue.use(Vuex);
        localVue.use(VueRouter);

        let authStoreMock = null;
        let store = null;
        let router = null;

        beforeEach(() => {
            authStoreMock = {
                namespaced: true,
                actions: {
                    register: jest.fn(),
                },
            };
            router = new VueRouter({
                mode: "history",
                routes: [{ path: "/" }],
            });

            store = new Vuex.Store({
                modules: {
                    auth: authStoreMock,
                },
            });
        });

        it("#register-formを送信したらauth/registerアクションが実行される", async () => {
            const wrapper = shallowMount(Login, { store, router, localVue });

            await wrapper.vm.$router.push("/login");

            wrapper.find("#register-form").trigger("submit");

            expect(authStoreMock.actions.register).toHaveBeenCalled();
        });
    });
});
