import Vuex from "vuex";
import VueRouter from "vue-router";

import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import Login from "@/pages/Login.vue";

import { randomStr } from "../utils.js";

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

let wrapper = null;
const authStoreMock = {
    namespaced: true,
    state: {
        apiIsSuccess: true,
        loginValidationMessage: {},
        registerValidationMessage: {},
    },
    actions: {
        register: jest.fn(),
        login: jest.fn(),
    },
    mutations: {
        setLoginValidationMessage: jest.fn().mockImplementation(state => {
            state.loginValidationMessage = null;
        }),
        setRegisterValidationMessage: jest.fn().mockImplementation(state => {
            state.registerValidationMessage = null;
        }),
    },
};

const router = new VueRouter({
    mode: "history",
    routes: [{ path: "/" }],
});

afterEach(() => {
    wrapper = null;
});

describe("表示、入力関連", () => {
    beforeEach(() => {
        const store = new Vuex.Store({
            modules: {
                auth: authStoreMock,
            },
        });
        wrapper = mount(Login, {
            store,
            localVue,
        });
    });
    it("#login-tabをクリックしたらログインフォームが表示される", async done => {
        await wrapper.find("#login-tab").trigger("click");
        expect(wrapper.find("#login-form").isVisible()).toBe(true);
        expect(wrapper.find("#register-form").isVisible()).toBe(false);
        done();
    });

    it("#register-tabをクリックしたら登録フォームが表示される", async done => {
        await wrapper.find("#register-tab").trigger("click");
        expect(wrapper.find("#login-form").isVisible()).toBe(false);
        expect(wrapper.find("#register-form").isVisible()).toBe(true);
        done();
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
});

describe("Vuex", () => {
    describe("正常終了", () => {
        beforeEach(async () => {
            const store = new Vuex.Store({
                modules: {
                    auth: authStoreMock,
                },
            });

            wrapper = shallowMount(Login, { store, router, localVue });
            await wrapper.vm.$router.push("/login").catch(() => {});
        });

        it("#register-formを送信したらauth/registerアクションが実行される", async done => {
            expect(wrapper.vm.$route.path).toBe("/login");
            await wrapper.find("#register-form").trigger("submit");

            expect(authStoreMock.actions.register).toHaveBeenCalled();

            expect(wrapper.vm.$route.path).toBe("/");
            done();
        });

        it("#login-formを送信したらauth/registerアクションが実行される", async done => {
            expect(wrapper.vm.$route.path).toBe("/login");
            await wrapper.find("#login-form").trigger("submit");

            expect(authStoreMock.actions.login).toHaveBeenCalled();
            expect(wrapper.vm.$route.path).toBe("/");
            done();
        });
    });

    describe("異常終了", () => {
        let store = null;
        const computedValue = target =>
            Login.computed[target].call({ $store: store });
        const spyClearMessage = jest.spyOn(Login.methods, "clearMessage");

        beforeEach(async () => {
            authStoreMock.state.apiIsSuccess = false;
            authStoreMock.state.loginValidationMessage = {
                email: [randomStr()],
                password: [randomStr()],
            };
            authStoreMock.state.registerValidationMessage = {
                name: [randomStr()],
                email: [randomStr()],
                password: [randomStr(), randomStr()],
            };

            store = new Vuex.Store({
                modules: {
                    auth: authStoreMock,
                },
            });

            wrapper = shallowMount(Login, {
                store,
                router,
                localVue,
            });
            await wrapper.vm.$router.push("/login").catch(() => {});
        });

        afterEach(() => {
            authStoreMock.mutations.setLoginValidationMessage.mock.calls = [];
            authStoreMock.mutations.setRegisterValidationMessage.mock.calls = [];
            spyClearMessage.mock.calls = [];
        });

        it("registerの結果422エラーの時はリダイレクトしない", async done => {
            expect(wrapper.vm.$route.path).toBe("/login");

            await wrapper.find("#register-form").trigger("submit");

            expect(authStoreMock.actions.register).toHaveBeenCalled();
            expect(wrapper.vm.$route.path).toBe("/login");
            done();
        });
        it("loginの結果422エラーの時はリダイレクトしない", async done => {
            expect(wrapper.vm.$route.path).toBe("/login");

            await wrapper.find("#login-form").trigger("submit");

            expect(authStoreMock.actions.login).toHaveBeenCalled();
            expect(wrapper.vm.$route.path).toBe("/login");
            done();
        });

        it("#login-formのバリデーションエラーを正しく算出している", () => {
            const errors = computedValue("loginErrors");
            expect(errors).toEqual(authStoreMock.state.loginValidationMessage);
        });

        it("#register-formのバリデーションエラーを正しく算出している", () => {
            const errors = computedValue("registerErrors");

            expect(errors).toEqual(
                authStoreMock.state.registerValidationMessage
            );

            // registerがstoreからloginValidationMessageを受け取っていることを確認できればいい
        });
        it("clearMessage()により、authのloginValidationMessageとregisterValidationMessageがクリアされる", () => {
            // computedの各値を取得
            let loginErrors = computedValue("loginErrors");
            let registerErrors = computedValue("registerErrors");

            // computedの各値がauth.stateの対応するものと等しい
            expect(loginErrors).toEqual(
                authStoreMock.state.loginValidationMessage
            );
            expect(registerErrors).toEqual(
                authStoreMock.state.registerValidationMessage
            );

            authStoreMock.mutations.setLoginValidationMessage.mock.calls = [];
            authStoreMock.mutations.setRegisterValidationMessage.mock.calls = [];

            // mutationを実行
            wrapper.vm.clearMessage();

            // 各mutationが実行されたかチェック
            expect(
                authStoreMock.mutations.setLoginValidationMessage
            ).toHaveBeenCalledTimes(1);
            expect(
                authStoreMock.mutations.setRegisterValidationMessage
            ).toHaveBeenCalledTimes(1);

            // 更新後のcomputedの値を取得
            loginErrors = computedValue("loginErrors");
            registerErrors = computedValue("registerErrors");

            // clearMessage()によってcomputedの値がクリアされたことをチェック
            expect(loginErrors).toBe(null);
            expect(registerErrors).toBe(null);
        });
        it("ページアクセス時にclearMessage()が呼び出されている", () => {
            expect(spyClearMessage).toHaveBeenCalledTimes(1);
        });
        it("タブ切り替えによりclearMessage()が呼び出されている", async done => {
            spyClearMessage.mock.calls = [];
            expect(spyClearMessage).not.toHaveBeenCalled();
            await wrapper.setData({ tab: 2 });
            expect(spyClearMessage).toHaveBeenCalled();
            done();
        });
    });
});
