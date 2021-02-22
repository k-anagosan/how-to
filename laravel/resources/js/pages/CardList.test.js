import { shallowMount } from "@vue/test-utils";
import CardList from "@/pages/CardList.vue";

describe("CardList.vue", () => {
    const wrapper = shallowMount(CardList);
    it("正しいhtmlが出力される", () => {
        expect(wrapper.html()).toContain("<h1>Card List</h1>");
    });
});
