import TestUtils from "@/testutils";
import Icon from "@/components/Icon.vue";

const Test = new TestUtils();

const propsData = {
    icon: {
        name: "testuser",
    },
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(Icon, { propsData });
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.destroy();
    wrapper = null;
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
