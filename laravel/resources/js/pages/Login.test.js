import { mount } from "@vue/test-utils";
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

        console.log(data, wrapper.vm.$data.loginForm);
        expect(wrapper.vm.$data.loginForm).toEqual({
            email: data.email,
            password: data.password,
        });
    });

    it("#register-formに入力した値がdataに保存される", () => {
        const data = {
            username: randomStr(),
            email: randomStr(),
            password: randomStr(),
            passwordConfirmation: randomStr(),
        };

        wrapper.find("#username").setValue(data.username);
        wrapper.find("#email").setValue(data.email);
        wrapper.find("#password").setValue(data.password);
        wrapper
            .find("#password-confirmation")
            .setValue(data.passwordConfirmation);

        console.log(data, wrapper.vm.$data.registerForm);
        expect(wrapper.vm.$data.registerForm).toEqual({
            username: data.username,
            email: data.email,
            password: data.password,
            passwordConfirmation: data.passwordConfirmation,
        });
    });
});
