import TestUtils from "@/testutils";
import Edit from "@/pages/Edit.vue";

import { randomStr } from "../utils.js";

const Test = new TestUtils();

const allErrors = jest.fn().mockImplementation(() => []);
const [postItem, postPhoto] = [
    jest.fn().mockImplementation(() => randomStr(20)),
    jest.fn(),
];
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

const post = {
    namespaced: true,
    state: { ...initialState },
    getters: { allErrors },
    actions: { postItem, postPhoto },
    mutations: { setPostValidationMessage, setPhotoValidationMessage },
};

const options = {
    stubs: { "ion-icon": true },
};

let wrapper = null;
beforeEach(() => {
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
    const showingTest = async (tab, showTarget, hiddenTarget) => {
        await wrapper.find(tab).trigger("click");
        expect(wrapper.find(showTarget).isVisible()).toBe(true);
        expect(wrapper.find(hiddenTarget).isVisible()).toBe(false);
    };

    it("#write-tabをクリックしたらテキストエリアが表示される", async done => {
        await showingTest("#write-tab", ".edit-content", ".preview-content");
        expect(wrapper.vm.$data.tab).toBe(1);
        done();
    });

    it("#preview-tabをクリックしたらプレビューエリアが表示される", async done => {
        await showingTest("#preview-tab", ".preview-content", ".edit-content");
        expect(wrapper.vm.$data.tab).toBe(2);
        done();
    });

    it("フォームに入力した値がpostFormやtagsStringに保存される", async done => {
        const tags = [randomStr(), randomStr(), randomStr()];
        const inputData = {
            title: randomStr(),
            content: randomStr(),
            tagsString: `${tags[0]} ${tags[1]} ${tags[2]}`,
        };

        wrapper.find("[name='title']").setValue(inputData.title);
        await wrapper.find("[name='tags']").setValue(inputData.tagsString);
        wrapper.find("[name='content']").setValue(inputData.content);

        expect(wrapper.vm.$data.postForm).toEqual({
            title: inputData.title,
            tags,
            content: inputData.content,
        });
        expect(wrapper.vm.$data.tagsString).toBe(inputData.tagsString);
        done();
    });
});

describe("Vuex", () => {
    describe("正常終了", () => {
        const actionCheck = (spy, id, event) => {
            TestUtils.checkSpysAreCalled([spy], () =>
                wrapper.find(id).trigger(event)
            );
        };

        beforeEach(async () => {
            await Test.testRouting("/", "/edit");
            Test.clearSpysCalledTimes();
        });

        it("#editを送信したらpost/postItemアクションが実行される", async done => {
            await actionCheck(post.actions.postItem, "#edit", "submit");
            done();
        });

        it("#post-photoにアップロードしたらpost/postPhotoアクションが実行される", async done => {
            await actionCheck(post.actions.postPhoto, "#post-photo", "change");
            done();
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
            store = Test.setVuex({
                post: {
                    ...post,
                    state: { ...post.state, apiIsSuccess: false },
                    getters: { ...post.getters, allErrors },
                },
            });
            wrapper = Test.shallowWrapperFactory();
        });

        it("バリデーションメッセージを正しく算出している", () => {
            const errors = Test.computedValue("errors", {
                $store: store,
            });
            expect(errors).toEqual(message);
        });

        it("clearMessage()によりバリデーショメッセージをクリアできる", () => {
            const allErrors = jest.fn().mockImplementation(() => []);
            Test.setSpys({ allErrors });
            store = Test.setVuex({
                post: {
                    ...post,
                    getters: { ...post.getters, allErrors },
                },
            });
            wrapper = Test.shallowWrapperFactory();

            Test.clearSpysCalledTimes();

            TestUtils.checkSpysAreCalled(
                [setPostValidationMessage, setPhotoValidationMessage],
                wrapper.vm.clearMessage
            );
            expect(
                Test.computedValue("errors", { $store: store })
            ).toStrictEqual([]);
        });

        it("clearイベントが発火するとclearMessage()が呼び出される", () => {
            TestUtils.checkSpysAreCalled([spyClearMessage], () =>
                wrapper.find("errormessages-stub").vm.$emit("clear")
            );
        });
    });
});
