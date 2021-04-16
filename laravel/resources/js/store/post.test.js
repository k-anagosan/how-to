import TestUtils from "@/testutils";
import { randomStr, OK, CREATED, INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from "@/utils";

import post from "@/store/post";

const Test = new TestUtils();
const setErrorCode = jest.fn();
Test.setSpys({ setErrorCode });

const initialState = { ...post.state };

let store = null;
beforeEach(() => {
    store = Test.createVuexStore({
        error: {
            namespaced: true,
            mutations: {
                setErrorCode,
            },
        },
        post: {
            ...post,
            state: { ...initialState },
        },
    });
});

afterEach(() => {
    Test.restoreAxios();
});

describe("post.js actions", () => {
    describe("API request succeded", () => {
        const postId = { post_id: randomStr(20) };
        const postFilename = { filename: `${randomStr(20)}.jpg` };
        const article = {
            id: randomStr(20),
            title: randomStr(30),
            content: randomStr(100),
            tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
            author: {
                name: randomStr(10),
            },
        };
        const articleList = {
            data: [article, article, article, article],
        };

        it.each([
            ["postItem", "ID", postId, CREATED],
            ["postPhoto", "ファイル名", postFilename, CREATED],
            ["getArticle", "記事データ", article, OK],
            ["getArticleList", "記事リスト", articleList, OK],
        ])("%sにより正しい%sが取得できるか", async (action, _, data, status) => {
            let [get, post] = [null, null];
            if (action === "postItem" || action === "postPhoto") {
                post = () => ({ data, status });
            } else {
                get = () => ({ data, status });
            }

            Test.mockAxios(get, post);

            if (action === "postItem") {
                await Test.testApiResponse(`post/${action}`, data.post_id);
            } else if (action === "postPhoto") {
                await Test.testApiResponse(`post/${action}`, data.filename);
            } else {
                await Test.testApiResponse(`post/${action}`, data);
            }
        });
    });

    describe("API request failed with status code 500 or 404", () => {
        const res = () => ({
            data: null,
            status: INTERNAL_SERVER_ERROR,
        });

        const setErrorCodeTest = async action => {
            await TestUtils.checkSpyIsCalled(setErrorCode, [{}, INTERNAL_SERVER_ERROR], () =>
                Test.testedAction(`post/${action}`)
            );
        };

        beforeEach(() => {
            Test.mockAxios(res, res);
        });

        afterEach(() => {
            Test.clearSpysCalledTimes();
        });

        describe.each([["postItem"], ["postPhoto"], ["getArticle"], ["getArticleList"]])(
            "%sアクションでリクエストに失敗",
            action => {
                it("apiIsSuccessに正しく値が保存されるか", async done => {
                    await Test.testApiResult(`post/${action}`, false);
                    done();
                });

                it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                    await setErrorCodeTest(action);
                    done();
                });
            }
        );
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
            await Test.testedAction(`post/${action}`);
            expect(store.state.post.apiIsSuccess).toBe(false);
            expect(store.state.post[postOrPhoto]).toBe(message);
        };

        it.each([
            ["postItem", "postValidationMessage"],
            ["postPhoto", "photoValidationMessage"],
        ])("%sアクションに422エラーで失敗した時、%sに正しく値が保存されるか", async (action, target) => {
            if (action === "postItem") {
                delete message.photo;
            } else {
                delete message.title;
                delete message.content;
            }

            const post = () => ({
                data: { errors: message },
                status: UNPROCESSABLE_ENTITY,
            });
            Test.mockAxios(null, post);
            await validationTest(action, `${target}`);
        });
    });
});

describe("post.js getters", () => {
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

            const message = Test.testedGetter("post/allErrors");
            expect(message).toStrictEqual(arrayMessage);
        });
        it("何もバリデーションメッセージが無いとき、allErrorsゲッターにより正しい値を取得できるか", () => {
            const message = Test.testedGetter("post/allErrors");
            expect(message).toStrictEqual([]);
        });
    });
});
