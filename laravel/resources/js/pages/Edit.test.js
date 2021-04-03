import Vuex from "vuex";
import VueRouter from "vue-router";

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Edit from "@/pages/Edit.vue";

import { randomStr } from "../utils.js";

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

let wrapper = null;
const postModuleMock = {
    namespaced: true,
    state: {
        apiIsSuccess: true,
        postValidationMessage: null,
        photoValidationMessage: null,
    },
    getters: {
        allErrors: jest.fn().mockImplementation(() => []),
    },
    actions: {
        postItem: jest.fn(),
        postPhoto: jest.fn(),
    },
    mutations: {
        setPostValidationMessage: jest.fn().mockImplementation(state => {
            state.postValidationMessage = null;
        }),
        setPhotoValidationMessage: jest.fn().mockImplementation(state => {
            state.photoValidationMessage = null;
        }),
    },
};

afterEach(() => {
    wrapper = null;
});

describe("表示、入力関連", () => {
    beforeEach(() => {
        const store = new Vuex.Store({
            modules: {
                post: postModuleMock,
            },
        });
        wrapper = shallowMount(Edit, {
            store,
            localVue,
            stubs: {
                "ion-icon": true,
            },
            mocks: {
                $marked: jest.fn().mockImplementation(val => val),
                $dompurify: {
                    sanitize: jest.fn().mockImplementation(val => val),
                },
            },
        });
    });

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

    it("プレビューにサニタイズされたhtmlが出力される", async done => {
        const content = randomStr(100);

        expect(wrapper.vm.$dompurify.sanitize).not.toHaveBeenCalled();
        expect(wrapper.vm.$marked).not.toHaveBeenCalled();
        await wrapper.find("[name='content']").setValue(content);

        expect(wrapper.vm.$data.htmlContent).toEqual(content);
        expect(wrapper.vm.$dompurify.sanitize).toHaveBeenCalled();
        expect(wrapper.vm.$marked).toHaveBeenCalled();
        done();
    });
});

describe("Vuex", () => {
    const router = new VueRouter({
        mode: "history",
        routes: [{ path: "/" }],
    });

    describe("正常終了", () => {
        beforeEach(async () => {
            const store = new Vuex.Store({
                modules: {
                    post: postModuleMock,
                },
            });

            wrapper = shallowMount(Edit, {
                store,
                router,
                localVue,
                stubs: {
                    "ion-icon": true,
                },
                mocks: {
                    $marked: jest.fn().mockImplementation(val => val),
                    $dompurify: {
                        sanitize: jest.fn().mockImplementation(val => val),
                    },
                },
            });
            await wrapper.vm.$router.push("/edit").catch(() => {});
        });

        it("#editを送信したらpost/postItemアクションが実行される", async done => {
            expect(postModuleMock.actions.postItem).not.toHaveBeenCalled();
            await wrapper.find("#edit").trigger("submit");
            expect(postModuleMock.actions.postItem).toHaveBeenCalled();
            done();
        });

        it("#post-photoにアップロードしたらpost/postPhotoアクションが実行される", async done => {
            expect(postModuleMock.actions.postPhoto).not.toHaveBeenCalled();
            await wrapper.find("#post-photo").trigger("change");
            expect(postModuleMock.actions.postPhoto).toHaveBeenCalled();
            done();
        });
    });
    describe("異常終了", () => {
        let store = null;
        const computedValue = target =>
            Edit.computed[target].call({ $store: store });

        const spyClearMessage = jest.spyOn(Edit.methods, "clearMessage");
        jest.spyOn(Edit.methods, "takeFile").mockImplementation(() => ({}));
        const message = [randomStr(), randomStr(), randomStr()];

        const createWrapper = () => {
            store = new Vuex.Store({
                modules: {
                    post: postModuleMock,
                },
            });

            wrapper = shallowMount(Edit, {
                store,
                router,
                localVue,
                mocks: {
                    $marked: jest.fn().mockImplementation(val => val),
                    $dompurify: {
                        sanitize: jest.fn().mockImplementation(val => val),
                    },
                },
                stubs: {
                    "ion-icon": true,
                },
            });
        };

        beforeEach(() => {
            postModuleMock.state.apiIsSuccess = false;
            postModuleMock.getters.allErrors = jest
                .fn()
                .mockImplementation(() => message);

            createWrapper();
        });
        afterEach(() => {
            postModuleMock.mutations.setPostValidationMessage.mock.calls = [];
            postModuleMock.mutations.setPhotoValidationMessage.mock.calls = [];
            spyClearMessage.mock.calls = [];
        });

        it("バリデーションメッセージを正しく算出している", () => {
            const errors = computedValue("errors");
            expect(errors).toEqual(message);
        });

        it("clearMessage()によりバリデーショメッセージをクリアできる", () => {
            postModuleMock.getters.allErrors = jest
                .fn()
                .mockImplementation(() => []);

            createWrapper();

            postModuleMock.mutations.setPostValidationMessage.mock.calls = [];
            postModuleMock.mutations.setPhotoValidationMessage.mock.calls = [];

            wrapper.vm.clearMessage();

            expect(spyClearMessage).toHaveBeenCalledTimes(1);
            expect(
                postModuleMock.mutations.setPostValidationMessage
            ).toHaveBeenCalledTimes(1);
            expect(
                postModuleMock.mutations.setPhotoValidationMessage
            ).toHaveBeenCalledTimes(1);

            expect(computedValue("errors")).toStrictEqual([]);
        });

        it("メッセージを閉じるボタンを押すとclearMessage()が呼び出される", async done => {
            await wrapper.find("#close-message").trigger("click");
            expect(spyClearMessage).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
