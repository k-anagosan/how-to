import { shallowMount } from "@vue/test-utils";
import MarkdownPreview from "@/components/MarkdownPreview.vue";

import { randomStr } from "@/utils";

const text = randomStr(200);

let wrapper = null;

const spyFormat = jest.spyOn(MarkdownPreview.methods, "format");
const $marked = jest.fn().mockImplementation(val => val);
const $dompurify = {
    sanitize: jest.fn().mockImplementation(val => val),
};

const computedValue = target =>
    MarkdownPreview.computed[target].call({
        text,
        format: spyFormat,
        $marked,
        $dompurify,
    });

beforeEach(() => {
    expect(spyFormat).not.toHaveBeenCalled();
    expect($marked).not.toHaveBeenCalled();
    expect($dompurify.sanitize).not.toHaveBeenCalled();
    wrapper = shallowMount(MarkdownPreview, {
        propsData: { text },
        mocks: {
            $marked,
            $dompurify,
        },
    });
});

afterEach(() => {
    spyFormat.mock.calls = [];
    $marked.mock.calls = [];
    $dompurify.sanitize.mock.calls = [];
});

describe("表示関連", () => {
    it("propsのtextを受け取ったらフォーマットが実行される", () => {
        expect(spyFormat).toHaveBeenCalled();
        expect($marked).toHaveBeenCalled();
        expect($dompurify.sanitize).toHaveBeenCalled();
    });

    it("正しい値でフォーマットされる", () => {
        expect(computedValue("formattedContent")).toBe(text);
    });

    it("マークダウンテキストが正しく表示される", () => {
        expect(wrapper.find(".md-preview-area").text()).toBe(text);
    });
});
