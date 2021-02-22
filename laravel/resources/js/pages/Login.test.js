import { shallowMount } from "@vue/test-utils";
import Login from "@/pages/Login.vue";

describe("Login.vue", () => {
    const wrapper = shallowMount(Login);
    it("正しいhtmlが出力される", () => {
        expect(wrapper.html()).toContain("<h1>Login</h1>");
    });
});
