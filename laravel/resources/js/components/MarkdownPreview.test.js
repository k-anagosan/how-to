import MarkdownPreview from "@/components/MarkdownPreview.vue";

import { randomStr } from "@/utils";
import TestUtils from "@/testutils";

const Test = new TestUtils();

const spyFormat = jest.spyOn(MarkdownPreview.methods, "format");
const $marked = jest.fn().mockImplementation(val => val);
const $dompurify = {
    sanitize: jest.fn().mockImplementation(val => val),
};

Test.setSpys({ spyFormat, $marked, sanitize: $dompurify.sanitize });

const text = randomStr(200);

const options = {
    propsData: { text },
    mocks: {
        $marked,
        $dompurify,
    },
};

let wrapper = null;
beforeEach(() => {
    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(MarkdownPreview, options);
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    Test.clearSpysCalledTimes();
});

describe("表示関連", () => {
    it("propsのtextを受け取ったらフォーマットが実行される", () => {
        Test.checkSpysHaveBeenCalled();
    });

    it("正しい値でフォーマットされる", () => {
        const options = {
            text,
            format: spyFormat,
            $marked,
            $dompurify,
        };
        expect(Test.computedValue("formattedContent", options)).toBe(text);
    });

    it("マークダウンテキストが正しく表示される", () => {
        expect(wrapper.find(".md-preview-area").text()).toBe(text);
    });
});
