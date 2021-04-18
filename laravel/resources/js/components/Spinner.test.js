import TestUtils from "@/testutils";
import Spinner from "@/components/Spinner.vue";

const Test = new TestUtils();

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(Spinner, {});
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper = null;
});

describe("表示関連", () => {
    it.each([
        ["何も設定されていない", "md", false],
        ["xsの", "xs", true],
        ["smの", "sm", true],
        ["mdの", "md", true],
        ["lgの", "lg", true],
    ])(`propsのsizeが%sとき.loader-%sが設定される`, async (_, size, isSetProps) => {
        if (isSetProps) await wrapper.setProps({ size });
        expect(wrapper.find(".loader").classes()).toContain(`loader-${size}`);
    });
});
