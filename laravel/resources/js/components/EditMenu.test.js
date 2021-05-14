import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";
import EditMenu from "@/components/EditMenu";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyCloseMenu = jest.spyOn(EditMenu.methods, "closeMenu");
Test.setSpys({ spyCloseMenu });

let options = null;
let wrapper = null;
beforeEach(() => {
    options = {
        stubs: { RouterLink: RouterLinkStub, "ion-icon": true },
        propsData: { articleId: randomStr() },
    };
    Test.setMountOption(EditMenu, options);
    Test.setVueRouter();

    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.vm.$router.push("/").catch(() => {});
    Test.clearSpysCalledTimes();
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it("ion-iconにid属性を正しく設定できる", () => {
        expect(wrapper.find("ion-icon-stub").attributes().id).toBe(`open-button-${wrapper.vm.articleId}`);
    });

    it.each([
        ["left", "-left-20"],
        ["right", "left-1/2"],
        ["設定されていない", "-left-20"],
    ])("propsのdirectionが%sなら、.edit-menuに.%sが設定される", async (direction, className) => {
        await wrapper.setData({ isShown: true });
        if (direction === "right" || direction === "left") await wrapper.setProps({ direction });
        expect(wrapper.find(".edit-menu").classes()).toContain(className);
    });

    it("メニュー開閉ボタンをクリックしたらメニューが表示される", async () => {
        expect(wrapper.find(".edit-menu").exists()).toBe(false);
        await wrapper.find(`#open-button-${wrapper.vm.articleId}`).vm.$emit("click");
        expect(wrapper.find(".edit-menu").exists()).toBe(true);
    });

    it("メニュー開閉時にメニュー開閉ボタンをクリックしたらメニューが閉じる", async () => {
        await wrapper.setData({ isShown: true });
        expect(wrapper.find(".edit-menu").exists()).toBe(true);
        await wrapper.find(`#open-button-${wrapper.vm.articleId}`).vm.$emit("click");
        expect(wrapper.find(".edit-menu").exists()).toBe(false);
    });
});

describe("メソッド関連", () => {
    it("何かをクリックしたらcloseMenu()が実行される", () => {
        const spyCloseMenu = jest.spyOn(EditMenu.methods, "closeMenu").mockImplementation(() => {});
        expect(spyCloseMenu).not.toHaveBeenCalled();
        window.dispatchEvent(new Event("click"));
        expect(spyCloseMenu).toHaveBeenCalled();
        spyCloseMenu.mockRestore();
    });

    it("closeMenu()が実行されたらisShownにfalseが代入される", () => {
        wrapper.setData({ isShown: true });
        const e = { target: wrapper.vm.$el };
        wrapper.vm.closeMenu(e);
        expect(wrapper.vm.$data.isShown).toBe(false);
    });
});
