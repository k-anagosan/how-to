import TestUtils from "@/testutils";
import Edit from "@/pages/Edit.vue";

import { randomStr } from "../utils.js";

const Test = new TestUtils();

const allErrors = jest.fn().mockImplementation(() => []);
const [postItem, postPhoto] = [jest.fn().mockImplementation(() => randomStr(20)), jest.fn()];
const [setPostValidationMessage, setPhotoValidationMessage] = [
    jest.fn().mockImplementation(state => {
        state.postValidationMessage = null;
    }),
    jest.fn().mockImplementation(state => {
        state.photoValidationMessage = null;
    }),
];

Test.setSpys({
    allErrors,
    postItem,
    postPhoto,
    setPostValidationMessage,
    setPhotoValidationMessage,
});

const initialState = {
    apiIsSuccess: true,
    postValidationMessage: null,
    photoValidationMessage: null,
};

const options = {
    stubs: { "ion-icon": true },
};

let post = null;
let wrapper = null;
beforeEach(() => {
    post = {
        namespaced: true,
        state: { ...initialState },
        getters: { allErrors },
        actions: { postItem, postPhoto },
        mutations: { setPostValidationMessage, setPhotoValidationMessage },
    };

    Test.setMountOption(Edit, options);
    Test.setVueRouter();
    Test.setVuex({ post });
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper = null;
});

describe("表示、入力関連", () => {
    it.each([
        ["#write-tab", "をクリックしたらテキストエリアが表示される"],
        ["#preview-tab", "をクリックしたらプレビューエリアが表示される"],
    ])("%s%s", async tab => {
        await wrapper.find(tab).trigger("click");
        expect(wrapper.find(".preview-content").isVisible()).toBe(tab === "#preview-tab");
        expect(wrapper.find(".edit-content").isVisible()).toBe(tab === "#write-tab");
    });

    it.each([
        ["title", "postForm", randomStr()],
        ["tags", "tagsString", `${randomStr()} ${randomStr()} ${randomStr()}`],
        ["content", "postForm", randomStr()],
    ])("%sフォームに入力した値が%sに保存される", async (name, _, inputData) => {
        if (name === "tags") {
            await wrapper.find(`[name='${name}']`).setValue(inputData);
            expect(wrapper.vm.$data.postForm[name]).toEqual(inputData.split(" "));
            expect(wrapper.vm.$data.tagsString).toBe(inputData);
        } else {
            wrapper.find(`[name='${name}']`).setValue(inputData);
            expect(wrapper.vm.$data.postForm[name]).toBe(inputData);
        }
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#edit-form").exists()).toBe(!isShown);
    });
});

describe("Vuex", () => {
    describe("正常終了", () => {
        const actionCheck = (spy, id, event) => {
            TestUtils.checkSpysAreCalled([spy], async () => {
                await wrapper.find(id).trigger(event);
            });
        };

        beforeEach(async () => {
            await Test.testRouting("/", "/edit");
            Test.clearSpysCalledTimes();
        });

        it.each([
            ["#edit", "を送信", "postItem", "submit"],
            ["#post-photo", "にアップロード", "postPhoto", "change"],
        ])("%s%sしたらpost/%sが実行される", (id, _, action, event) => {
            actionCheck(post.actions[action], id, event);
        });
    });
    describe("異常終了", () => {
        const message = [randomStr(), randomStr(), randomStr()];
        const spyClearMessage = jest.spyOn(Edit.methods, "clearMessage");
        const allErrors = jest.fn().mockImplementation(() => message);
        Test.setSpys({ spyClearMessage, allErrors });

        jest.spyOn(Edit.methods, "takeFile").mockImplementation(() => ({}));
        let store = null;

        beforeEach(() => {
            post.state.apiIsSuccess = false;
            post.getters.allErrors = allErrors;
            store = Test.setVuex({ post });
            wrapper = Test.shallowWrapperFactory();
        });

        it("バリデーションメッセージを正しく算出している", () => {
            const errors = Test.computedValue("errors", { $store: store });
            expect(errors).toEqual(message);
        });

        it("clearMessage()によりバリデーショメッセージをクリアできる", () => {
            const allErrors = jest.fn().mockImplementation(() => []);
            Test.setSpys({ allErrors });
            post.getters.allErrors = allErrors;
            store = Test.setVuex({ post });
            wrapper = Test.shallowWrapperFactory();

            Test.clearSpysCalledTimes();

            TestUtils.checkSpysAreCalled(
                [setPostValidationMessage, setPhotoValidationMessage],
                wrapper.vm.clearMessage
            );
            expect(Test.computedValue("errors", { $store: store })).toStrictEqual([]);
        });

        it("clearイベントが発火するとclearMessage()が呼び出される", () => {
            TestUtils.checkSpysAreCalled([spyClearMessage], () => wrapper.find("errormessages-stub").vm.$emit("clear"));
        });
    });
});
