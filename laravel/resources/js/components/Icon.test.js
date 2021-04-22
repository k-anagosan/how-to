import TestUtils from "@/testutils";
import Icon from "@/components/Icon.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyOnClick = jest.spyOn(Icon.methods, "onClick");
Test.setSpys({ spyOnClick });

const propsData = {
    icon: {
        name: "testuser",
    },
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(Icon, { propsData });
    Test.setVueRouter();
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.destroy();
    wrapper = null;
    Test.clearSpysCalledTimes();
});

describe("表示関連", () => {
    const checkClass = className => {
        expect(wrapper.find(".icon").classes()).toContain(className);
    };

    it("propsのiconを受け取ったら名前が表示される", () => {
        expect(wrapper.find("span").text()).toBe(propsData.icon.name);
    });

    it("propsのsizeが無ければicon-size-mdクラスが付与される", () => {
        checkClass("icon-size-md");
    });

    it.each([["sm"], ["md"], ["lg"]])("propsのsizeが'%s'ならicon-size-%sクラスが付与される", size => {
        propsData.size = size;
        Test.setMountOption(Icon, { propsData });
        wrapper = Test.shallowWrapperFactory();
        checkClass(`icon-size-${size}`);
    });
});

describe("イベント関連", () => {
    it("#id-wrapeprをクリックしたらonClick()が実行される", async () => {
        expect(spyOnClick).not.toHaveBeenCalled();
        await wrapper.find("#id-wrapper").trigger("click");
        expect(spyOnClick).toHaveBeenCalled();
    });

    it.each([
        ["でないなら", "実行される", null],
        ["であるなら", "実行されない", randomStr()],
    ])("onClick()が実行されたときtoがnull%s、push()が%s", async (_, __, to) => {
        propsData.to = to;
        Test.setMountOption(Icon, { propsData });
        wrapper = Test.shallowWrapperFactory();
        const spyPush = jest.spyOn(wrapper.vm.$router, "push");
        Test.setSpys({ spyPush });

        expect(spyPush).not.toHaveBeenCalled();
        await wrapper.vm.onClick();
        if (to) {
            expect(spyPush).toHaveBeenCalled();
            expect(spyPush.mock.calls).toEqual([[to]]);
        } else {
            expect(spyPush).not.toHaveBeenCalled();
        }
    });
});
