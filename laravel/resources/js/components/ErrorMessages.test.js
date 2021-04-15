import TestUtils from "@/testutils";
import ErrorMessages from "@/components/ErrorMessages.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyOnClick = jest.spyOn(ErrorMessages.methods, "onClick");
Test.setSpys({ spyOnClick });

let propsData = null;
let options = null;
let wrapper = null;
beforeEach(() => {
    propsData = {
        errors: [randomStr(), randomStr(), randomStr()],
    };
    options = {
        stubs: ["ion-icon"],
        propsData,
    };
    Test.setMountOption(ErrorMessages, options);
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it("propsのerrorsがデフォルトなら何も表示されない", () => {
        options.propsData = {};
        Test.setMountOption(ErrorMessages, options);
        wrapper = Test.shallowWrapperFactory();
        expect(wrapper.text()).toBe("");
    });

    it("propsのerrorsを受け取ったらエラーメッセージが表示される", () => {
        wrapper.findAll("li").wrappers.forEach((wrapper, index) => {
            expect(wrapper.text()).toBe(propsData.errors[index]);
        });
    });

    it("buttonがクリックされたらonClick()が実行される", () => {
        expect(spyOnClick).not.toHaveBeenCalled();
        wrapper.find("button").trigger("click");
        expect(spyOnClick).toHaveBeenCalled();
    });

    it("onClick()が実行されたらclearイベントが発火される", () => {
        wrapper.find("button").trigger("click");
        expect(wrapper.emitted()).toEqual({ clear: [[]] });
    });
});
