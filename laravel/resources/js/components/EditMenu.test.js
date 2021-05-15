import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";
import EditMenu from "@/components/EditMenu";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyOnClick = jest.spyOn(EditMenu.methods, "onClick");
const spyOnKeyDown = jest.spyOn(EditMenu.methods, "onKeyDown");
const spyCloseMenu = jest.spyOn(EditMenu.methods, "closeMenu");
const spyDeleteArticle = jest.spyOn(EditMenu.methods, "deleteArticle");
Test.setSpys({ spyOnClick, spyCloseMenu, spyOnKeyDown, spyDeleteArticle });

let options = null;
let wrapper = null;
beforeEach(() => {
    options = {
        stubs: { RouterLink: RouterLinkStub, "ion-icon": true },
        propsData: { articleId: randomStr() },
    };
    Test.setMountOption(EditMenu, options);
    const post = {
        namespaced: true,
        actions: {
            deleteItem: jest.fn().mockImplementation(() => randomStr(20)),
        },
    };
    Test.setSpys({ deleteItem: post.actions.deleteItem });
    Test.setVuex({ post });

    Test.setVueRouter();

    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.vm.$router.push("/").catch(() => {});
    Test.clearSpysCalledTimes();
    wrapper.destroy();
    wrapper = null;
});

describe("表示、操作関連", () => {
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

    it("削除ボタンをクリックしたらonClick()が実行される", async () => {
        await wrapper.setData({ isShown: true });

        expect(spyOnClick).not.toHaveBeenCalled();
        await wrapper.find(".delete-button").trigger("click");
        expect(spyOnClick).toHaveBeenCalled();
    });
});

describe("メソッド関連", () => {
    describe("クリックイベント関連", () => {
        it("何かをクリックしたらcloseMenu()が実行される", () => {
            const spyCloseMenu = jest.spyOn(EditMenu.methods, "closeMenu").mockImplementation(() => {});
            expect(spyCloseMenu).not.toHaveBeenCalled();
            window.dispatchEvent(new Event("click"));
            expect(spyCloseMenu).toHaveBeenCalled();
            spyCloseMenu.mockRestore();
        });

        it("#open-button-xxx以外でcloseMenu()が実行されたらisShownにfalseが代入される", () => {
            wrapper.setData({ isShown: true });
            const e = { target: wrapper.vm.$el };
            wrapper.vm.closeMenu(e);
            expect(wrapper.vm.$data.isShown).toBe(false);
        });

        it("#open-button-xxxでcloseMenu()が実行されてもisShownにfalseは代入されない", () => {
            wrapper.setData({ isShown: true });
            const e = { target: wrapper.find(`#open-button-${wrapper.vm.articleId}`).vm.$el };
            wrapper.vm.closeMenu(e);
            expect(wrapper.vm.$data.isShown).toBe(true);
        });

        it("onClick()が実行されたらdeleteArticle()が実行される", async () => {
            expect(spyDeleteArticle).not.toHaveBeenCalled();
            await wrapper.vm.deleteArticle();
            expect(spyDeleteArticle).toHaveBeenCalled();
        });

        it("deleteArticle()が実行されたらdeleteイベントが発火される", async () => {
            expect(wrapper.emitted().delete).toBeUndefined();
            await wrapper.vm.deleteArticle();
            expect(wrapper.emitted().delete).toEqual([[]]);
        });
    });

    describe("キーダウンイベント関連", () => {
        it("何かのキーを入力したらonKeyDown()が実行される", () => {
            const spyOnKeyDown = jest.spyOn(EditMenu.methods, "onKeyDown").mockImplementation(() => {});
            expect(spyOnKeyDown).not.toHaveBeenCalled();
            window.dispatchEvent(new KeyboardEvent("keydown"));
            expect(spyOnKeyDown).toHaveBeenCalled();
            spyOnKeyDown.mockRestore();
        });

        it("'Escape'キー押下でonKeyDown()が実行されたらisShownにfalseが代入される", () => {
            wrapper.setData({ isShown: true });
            const e = { key: "Escape" };
            wrapper.vm.onKeyDown(e);
            expect(wrapper.vm.$data.isShown).toBe(false);
        });

        it("'Escape'キー以外の押下でonKeyDown()が実行されてもisShownにfalseは代入されない", () => {
            wrapper.setData({ isShown: true });
            const e = { key: "Enter" };
            wrapper.vm.onKeyDown(e);
            expect(wrapper.vm.$data.isShown).toBe(true);
        });
    });
});
