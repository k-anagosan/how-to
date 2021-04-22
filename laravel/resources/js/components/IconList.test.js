import TestUtils from "@/testutils";
import IconList from "@/components/IconList.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();

const propsData = {
    icons: [{ name: randomStr() }, { name: randomStr() }, { name: randomStr() }, { name: randomStr() }],
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(IconList, { propsData });
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it("props.iconsの各アイテムを個別にIconに渡せる", () => {
        wrapper.findAll("icon-stub").wrappers.forEach((wrapper, index) => {
            expect(wrapper.props().icon).toEqual(propsData.icons[index]);
        });
    });

    it.each([["sm"], ["md"], ["lg"]])("propsのsize=%sを各Iconに渡せる", size => {
        propsData.size = size;
        Test.setMountOption(IconList, { propsData });
        wrapper = Test.shallowWrapperFactory();
        wrapper.findAll("icon-stub").wrappers.forEach(wrapper => {
            expect(wrapper.props().size).toBe(propsData.size);
        });
    });

    it.each([
        ["あればそれを加味したtoを", `/${randomStr()}`],
        ["無ければicon.nameのみをtoに", ""],
    ])("propsにtoが%s各Iconに渡せる", (_, to) => {
        propsData.to = to;
        Test.setMountOption(IconList, { propsData });
        wrapper = Test.shallowWrapperFactory();
        wrapper.findAll("card-stub").wrappers.forEach((wrapper, index) => {
            expect(wrapper.props().to).toBe(`${to}/${propsData.icons[index].name}`);
        });
    });

    it("propsのdirectionがrowなら'grid-cols-2'クラスが付与される", () => {
        propsData.direction = "row";
        Test.setMountOption(IconList, { propsData });
        wrapper = Test.shallowWrapperFactory();
        expect(wrapper.find("ul.grid").classes()).toContain("grid-cols-2");
    });
});
