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
        const pageData = { user_id: Math.floor(Math.random() * 100), followed_by_me: false };
        const article = {
            id: randomStr(20),
            title: randomStr(30),
            tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
            author: { name: randomStr(10) },
            liked_count: 10,
            liked_by_me: false,
        };
        const follower = {
            id: Math.floor(Math.random(1, 100)),
            name: randomStr(),
            followed_by_me: false,
        };
        const articleList = {
            data: [article, article, article, article],
        };
        const followerList = {
            data: [follower, follower, follower, follower],
        };

        it.each([
            ["getUserPageData", "ユーザーページの左カラム表示に必要な情報が取得できるか", pageData, OK, ""],
            ["getArticles", "ユーザーページのArticles表示に必要な情報を取得できるか", articleList, OK, "articles"],
            [
                "getArchivedArticles",
                "ユーザーページのArchives表示に必要な情報を取得できるか",
                articleList,
                OK,
                "archives",
            ],
            ["getLikedArticles", "ユーザーページのLikes表示に必要な情報を取得できるか", articleList, OK, "likes"],
            [
                "getFollowerList",
                "ユーザーページのFollowerList表示に必要な情報を取得できるか",
                followerList,
                OK,
                "followers",
            ],
        ])("%sにより正しく%s", async (action, _, data, status, state) => {
            const get = () => ({ data, status });

            Test.mockAxios(get, null, null, null);

            if (action === "getUserPageData") {
                await Test.testApiResponse(`userpage/${action}`, data);
            } else {
                await Test.testStateWithAction(`userpage/${action}`, state, data);
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

        describe.each([
            ["getUserPageData"],
            ["getArticles"],
            ["getArchivedArticles"],
            ["getLikedArticles"],
            ["getFollowerList"],
        ])("%sアクションでリクエストに失敗", action => {
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
