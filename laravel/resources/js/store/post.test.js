import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";
import {
    randomStr,
    CREATED,
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
} from "@/utils";

import post from "@/store/post";

const localVue = createLocalVue();
localVue.use(Vuex);

let store = null;
const setErrorCode = jest.fn();

beforeEach(() => {
    const error = {
        namespaced: true,
        mutations: {
            setErrorCode,
        },
    };

    store = new Vuex.Store({
        modules: {
            post,
            error,
        },
    });
});

const testedAction = (action, payload = {}) =>
    store.dispatch(`post/${action}`, payload);

describe("post.js actions", () => {
    let windowSpy = null;
    let originalWindow = null;

    const mockAxios = (res, status) => {
        windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: {
                post: (url, data) => ({
                    data: res(url, data),
                    status,
                }),
            },
        }));
    };

    beforeEach(() => {
        originalWindow = { ...window };
        windowSpy = jest.spyOn(global, "window", "get");
    });
    afterEach(() => {
        windowSpy.mockRestore();
        store.commit("post/setApiIsSuccess", null, { root: true });
    });

    describe("API request succeded", () => {
        it("postItemアクションにより正しいIDが取得できるか", async done => {
            const postId = randomStr(20);
            const res = () => ({
                post_id: postId,
            });

            mockAxios(res, CREATED);

            expect(store.state.post.apiIsSuccess).toBe(null);
            const receiveId = await testedAction("postItem");

            expect(receiveId).toEqual(postId);
            expect(store.state.post.apiIsSuccess).toBe(true);
            done();
        });

        it("postPhotoアクションにより正しいファイル名が取得できるか*", async done => {
            const postFilename = `${randomStr(20)}.jpg`;
            const res = () => ({
                filename: postFilename,
            });

            mockAxios(res, CREATED);

            expect(store.state.post.apiIsSuccess).toBe(null);
            const receiveFilename = await testedAction("postPhoto");

            expect(receiveFilename).toEqual(postFilename);
            expect(store.state.post.apiIsSuccess).toBe(true);
            done();
        });
    });

    describe("API request failed with status code 500", () => {
        beforeEach(() => {
            mockAxios(() => null, INTERNAL_SERVER_ERROR);
            setErrorCode.mock.calls = [];
        });

        const apiIsSuccessTest = async action => {
            expect(store.state.post.apiIsSuccess).toBe(null);
            await testedAction(action);
            expect(store.state.post.apiIsSuccess).toBe(false);
        };

        const setErrorCodeTest = async action => {
            expect(setErrorCode).toHaveBeenCalledTimes(0);
            await testedAction(action);
            expect(setErrorCode).toHaveBeenCalledTimes(1);
            expect(setErrorCode.mock.calls[0][1]).toBe(INTERNAL_SERVER_ERROR);
        };

        describe("postItem アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await apiIsSuccessTest("postItem");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest("postItem");
                done();
            });
        });
        describe("postPhoto アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await apiIsSuccessTest("postPhoto");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest("postPhoto");
                done();
            });
        });
    });

    describe("API request failed with status code 422", () => {
        let message = null;
        beforeEach(() => {
            message = {
                title: [randomStr(), randomStr()],
                content: [randomStr(), randomStr()],
                photo: [randomStr(), randomStr()],
            };
        });

        const validationTest = async (action, postOrPhoto) => {
            expect(store.state.post.apiIsSuccess).toBe(null);
            expect(store.state.post[postOrPhoto]).toBe(null);
            await testedAction(action);

            expect(store.state.post.apiIsSuccess).toBe(false);
            expect(store.state.post[postOrPhoto]).toBe(message);
        };

        it("postItemアクションに422エラーで失敗した時、postValidationMessageに正しく値が保存されるか", async done => {
            delete message.photo;
            const res = () => ({
                errors: message,
            });
            mockAxios(res, UNPROCESSABLE_ENTITY);

            await validationTest("postItem", "postValidationMessage");
            done();
        });

        it("postPhotoアクションに422エラーで失敗した時、photoValidationMessageに正しく値が保存されるか", async done => {
            delete message.title;
            delete message.content;
            const res = () => ({
                errors: message,
            });
            mockAxios(res, UNPROCESSABLE_ENTITY);

            await validationTest("postPhoto", "photoValidationMessage");
            done();
        });
    });
});

describe("post.js getters", () => {
    const testedGetter = getter => store.getters[`post/${getter}`];
    const state = { store };

    beforeEach(() => {
        store.commit("post/setPostValidationMessage", null);
        store.commit("post/setPhotoValidationMessage", null);
    });

    describe("allErrors", () => {
        it("バリデーションメッセージがあるとき、allErrorsゲッターにより正しい値を取得できるか", () => {
            const arrayMessage = [...Array(6)].map(() => randomStr());

            store.commit("post/setPostValidationMessage", {
                title: [arrayMessage[0], arrayMessage[1]],
                content: [arrayMessage[2], arrayMessage[3]],
            });
            store.commit("post/setPhotoValidationMessage", {
                photo: [arrayMessage[4], arrayMessage[5]],
            });

            const message = testedGetter("allErrors", state);

            expect(message).toStrictEqual(arrayMessage);
        });
        it("何もバリデーションメッセージが無いとき、allErrorsゲッターにより正しい値を取得できるか", () => {
            const message = testedGetter("allErrors", state);

            expect(message).toStrictEqual([]);
        });
    });
});
