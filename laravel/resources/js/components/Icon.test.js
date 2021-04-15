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

    it("propsのsizeが'sm'ならicon-size-smクラスが付与される", () => {
        propsData.size = "sm";
        Test.setMountOption(Icon, { propsData });
        wrapper = Test.shallowWrapperFactory();
        checkClass("icon-size-sm");
    });

    it("propsのsizeが'md'ならicon-size-mdクラスが付与される", () => {
        propsData.size = "md";
        Test.setMountOption(Icon, { propsData });
        wrapper = Test.shallowWrapperFactory();
        checkClass("icon-size-md");
    });

    it("propsのsizeが'lg'ならicon-size-lgクラスが付与される", () => {
        propsData.size = "lg";
        Test.setMountOption(Icon, { propsData });
        wrapper = Test.shallowWrapperFactory();
        checkClass("icon-size-lg");
    });
});
