import TestUtils from "@/testutils";
import Login from "@/pages/Login.vue";
import { randomStr } from "../utils.js";

const Test = new TestUtils();

let auth = null;

let wrapper = null;
beforeEach(() => {
    auth = {
        namespaced: true,
        state: { apiIsSuccess: true, loginValidationMessage: {}, registerValidationMessage: {} },
        actions: { register: jest.fn(), login: jest.fn() },
        getters: {
            registerErrors: jest.fn().mockImplementation(() => []),
            loginErrors: jest.fn().mockImplementation(() => []),
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
    Test.setSpys({
        register: auth.actions.register,
        login: auth.actions.login,
        registerErrors: auth.getters.registerErrors,
        loginErrors: auth.getters.loginErrors,
        loginValidation: auth.mutations.setLoginValidationMessage,
        registerValidation: auth.mutations.setRegisterValidationMessage,
    });
    Test.setMountOption(Login, {});
    Test.setVuex({ auth });
    Test.setVueRouter();
    wrapper = Test.shallowWrapperFactory();
});
afterEach(() => {
    wrapper.vm.$router.push("/").catch(() => {});
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示、入力関連", () => {
    const data = {
        name: randomStr(),
        email: randomStr(),
        password: randomStr(),
        passwordConfirmation: randomStr(),
    };

    it.each([
        ["#login-tab", "ログインフォーム"],
        ["#register-tab", "登録フォーム"],
    ])("%sをクリックしたら%sが表示される", async target => {
        await wrapper.find(target).trigger("click");
        const isLoginForm = target === "#login-tab";
        expect(wrapper.find("#login-form").isVisible()).toBe(isLoginForm);
        expect(wrapper.find("#register-form").isVisible()).toBe(!isLoginForm);
    });

    it.each([
        ["#login-form", ["#login-email", "#login-password"], ["email", "password"], [data.email, data.password]],
        [
            "#register-form",
            ["#username", "#email", "#password", "#password-confirmation"],
            ["name", "email", "password", "password_confirmation"],
            [data.name, data.email, data.password, data.passwordConfirmation],
        ],
    ])("%sに入力した値がdataに保存される", (formId, ids, props, datas) => {
        wrapper = Test.wrapperFactory();
        ids.forEach((id, index) => {
            wrapper.find(id).setValue(datas[index]);
            const form = formId === "#login-form" ? "loginForm" : "registerForm";
            expect(wrapper.vm.$data[form][props[index]]).toBe(datas[index]);
        });
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", isShown => {
        if (isShown) {
            auth.state.apiIsSuccess = null;
            Test.setVuex({ auth });
            wrapper = Test.shallowWrapperFactory();
        }
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#login").exists()).toBe(!isShown);
    });
});

describe("Vuex", () => {
    describe("正常終了", () => {
        beforeEach(async () => {
            await Test.testRouting("/", "/login");
        });

        it.each([
            ["#register-form", "register"],
            ["#login-form", "login"],
        ])("%sを送信したらauth/%sが実行される", async (id, action) => {
            expect(wrapper.vm.$route.path).toBe("/login");
            await TestUtils.checkSpysAreCalled([auth.actions[action]], async () => {
                await wrapper.find(id).trigger("submit");
            });
            expect(wrapper.vm.$route.path).toBe("/");
        });
    });

    describe("異常終了", () => {
        let store = null;
        let [loginErrors, registerErrors] = [null, null];
        const spyClearMessage = jest.spyOn(Login.methods, "clearMessage");
        Test.setSpys({ spyClearMessage });
        const authFactory = () => {
            auth.state.apiIsSuccess = false;
            auth.state.loginValidationMessage = {
                email: [randomStr()],
                password: [randomStr()],
            };
            auth.state.registerValidationMessage = {
                name: [randomStr()],
                email: [randomStr()],
                password: [randomStr(), randomStr()],
            };
            loginErrors = [...auth.state.loginValidationMessage.email, ...auth.state.loginValidationMessage.password];
            auth.getters.loginErrors = jest.fn().mockImplementation(() => loginErrors);
            registerErrors = [
                ...auth.state.registerValidationMessage.name,
                ...auth.state.registerValidationMessage.email,
                ...auth.state.registerValidationMessage.password,
            ];
            auth.getters.registerErrors = jest.fn().mockImplementation(() => registerErrors);
            Test.setSpys({ loginErrors: auth.getters.loginErrors, registerErrors: auth.getters.registerErrors });
            return auth;
        };
        beforeEach(async () => {
            auth = authFactory();
            store = Test.setVuex({ auth });
            wrapper = Test.shallowWrapperFactory();
            await Test.testRouting("/", "/login");
        });

        it.each([
            ["register", "#register-form"],
            ["login", "#login-form"],
        ])("%sの結果422エラーの時はリダイレクトしない", async (action, form) => {
            await TestUtils.checkSpysAreCalled([auth.actions[action]], async () => {
                expect(wrapper.vm.$route.path).toBe("/login");
                await wrapper.find(form).trigger("submit");
                expect(wrapper.vm.$route.path).toBe("/login");
            });
        });

        it.each([
            ["#login-form", "loginErrors"],
            ["#register-form", "registerErrors"],
        ])("%sのバリデーションエラーを正しく算出している", (_, target) => {
            const errors = Test.computedValue(target, { $store: store });
            expect(errors).toEqual(auth.getters[target]());
        });

        it("ページアクセス時にclearMessage()が呼び出されている", () => {
            expect(spyClearMessage).toHaveBeenCalled();
        });
        it("タブ切り替えによりclearMessage()が呼び出されている", async done => {
            Test.clearSpysCalledTimes();
            await TestUtils.checkSpysAreCalled([spyClearMessage], () => {
                wrapper.setData({ tab: 2 });
            });
            done();
        });
        it("タイマーセットしたらclearMessage()が数秒後に実行される", async done => {
            jest.setTimeout(10000);
            Test.clearSpysCalledTimes();
            await wrapper.vm.setTimer();
            expect(spyClearMessage).not.toHaveBeenCalled();
            setTimeout(() => {
                expect(spyClearMessage).toHaveBeenCalled();
                done();
            }, 5000);
        });
    });
});
