import TestUtils from "@/testutils";
import { randomStr, OK, INTERNAL_SERVER_ERROR } from "@/utils";

import userpage from "@/store/userpage";

const Test = new TestUtils();
const setErrorCode = jest.fn();
Test.setSpys({ setErrorCode });

const initialState = { ...userpage.state };

beforeEach(() => {
    Test.createVuexStore({
        error: { namespaced: true, mutations: { setErrorCode } },
        userpage: { ...userpage, state: { ...initialState } },
    });
});

afterEach(() => {
    Test.restoreAxios();
});

describe("userpage.js actions", () => {
    describe("API request succeded", () => {
        const userId = { user_id: Math.floor(Math.random() * 100) };
        const article = {
            id: randomStr(20),
            title: randomStr(30),
            content: randomStr(100),
            tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
            author: { name: randomStr(10) },
        };
        const articleList = {
            data: [article, article, article, article],
        };

        it.each([
            ["getUserId", "IDが取得できるか", userId, OK],
            ["getArticles", "ユーザーページのArticles表示に必要な情報を取得できるか", articleList, OK],
        ])("%sにより正しく%s", async (action, _, data, status) => {
            const get = () => ({ data, status });

            Test.mockAxios(get, null, null, null);

            if (action === "getArticles") {
                await Test.testStateWithAction(`userpage/${action}`, "articles", data);
            } else {
                await Test.testApiResponse(`userpage/${action}`, data.user_id);
            }
        });
    });

    describe("API request failed with status code 500 , 404 or 401", () => {
        const res = () => ({
            data: null,
            status: INTERNAL_SERVER_ERROR,
        });

        const setErrorCodeTest = async action => {
            await TestUtils.checkSpyIsCalled(setErrorCode, [{}, INTERNAL_SERVER_ERROR], () =>
                Test.testedAction(`userpage/${action}`, {})
            );
        };

        beforeEach(() => {
            Test.mockAxios(res, res, res, res);
        });

        afterEach(() => {
            Test.clearSpysCalledTimes();
        });

        describe.each([["getUserId"], ["getArticles"]])("%sアクションでリクエストに失敗", action => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await Test.testApiResult(`userpage/${action}`, false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await setErrorCodeTest(action);
                done();
            });
        });
    });
});
