import TestUtils from "@/testutils";
import {
    randomStr,
    OK,
    CREATED,
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
} from "@/utils";

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
        const postId = randomStr(20);
        const postFilename = `${randomStr(20)}.jpg`;
        const article = {
            id: randomStr(20),
            title: randomStr(30),
            content: randomStr(100),
            tags: [
                { name: randomStr(10) },
                { name: randomStr(10) },
                { name: randomStr(10) },
            ],
            author: {
                name: randomStr(10),
            },
        };
        const articleList = {
            data: [article, article, article, article],
        };

        it("postItemアクションにより正しいIDが取得できるか", async done => {
            const post = () => ({
                data: { post_id: postId },
                status: CREATED,
            });
            Test.mockAxios(null, post);
            await Test.testApiResponse("post/postItem", postId);
            done();
        });

        it("postPhotoアクションにより正しいファイル名が取得できるか*", async done => {
            const post = () => ({
                data: { filename: postFilename },
                status: CREATED,
            });
            Test.mockAxios(null, post);
            await Test.testApiResponse("post/postPhoto", postFilename);
            done();
        });

        it("getArticleアクションにより記事データが取得できるか*", async done => {
            const get = () => ({
                data: article,
                status: OK,
            });
            Test.mockAxios(get, null);
            await Test.testApiResponse("post/getArticle", article);
            done();
        });

        it("getArticleListアクションにより記事データが取得できるか*", async done => {
            const get = () => ({
                data: articleList,
                status: OK,
            });
            Test.mockAxios(get, null);
            await Test.testApiResponse("post/getArticleList", articleList);
            done();
        });
    });

    describe("API request failed with status code 500 or 404", () => {
        const res = () => ({
            data: null,
            status: INTERNAL_SERVER_ERROR,
        });

        const setErrorCodeTest = async action => {
            await TestUtils.checkSpyIsCalled(
                setErrorCode,
                [{}, INTERNAL_SERVER_ERROR],
                () => Test.testedAction(`post/${action}`)
            );
        };

        beforeEach(() => {
            Test.mockAxios(res, res);
        });

        afterEach(() => {
            Test.clearSpysCalledTimes();
        });

        describe("postItem アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await Test.testApiResult("post/postItem", false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest("postItem");
                done();
            });
        });
        describe("postPhoto アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await Test.testApiResult("post/postPhoto", false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest("postPhoto");
                done();
            });
        });
        describe("getArticle アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await Test.testApiResult("post/getArticle", false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest("getArticle");
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
            await Test.testedAction(`post/${action}`);
            expect(store.state.post.apiIsSuccess).toBe(false);
            expect(store.state.post[postOrPhoto]).toBe(message);
        };

        it("postItemアクションに422エラーで失敗した時、postValidationMessageに正しく値が保存されるか", async done => {
            delete message.photo;
            const post = () => ({
                data: { errors: message },
                status: UNPROCESSABLE_ENTITY,
            });
            Test.mockAxios(null, post);
            await validationTest("postItem", "postValidationMessage");
            done();
        });

        it("postPhotoアクションに422エラーで失敗した時、photoValidationMessageに正しく値が保存されるか", async done => {
            delete message.title;
            delete message.content;
            const post = () => ({
                data: { errors: message },
                status: UNPROCESSABLE_ENTITY,
            });
            Test.mockAxios(null, post);

            await validationTest("postPhoto", "photoValidationMessage");
            done();
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
