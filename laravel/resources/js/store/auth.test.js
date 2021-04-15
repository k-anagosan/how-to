import TestUtils from "@/testutils";
import {
    randomStr,
    OK,
    CREATED,
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
} from "@/utils";

import auth from "@/store/auth";

const Test = new TestUtils();
const setErrorCode = jest.fn();
Test.setSpys({ setErrorCode });

const initialState = { ...auth.state };

let store = null;
beforeEach(() => {
    store = Test.createVuexStore({
        error: {
            namespaced: true,
            mutations: {
                setErrorCode,
            },
        },
        auth: {
            ...auth,
            state: { ...initialState },
        },
    });
});

afterEach(() => {
    Test.clearSpysCalledTimes();
    Test.restoreAxios();
});

describe("auth.js actions", () => {
    const data = {
        name: randomStr(),
        email: `${randomStr()}@${randomStr()}.com`,
        password: "password",
        password_confirmation: "password",
    };

    afterEach(() => {
        store.commit("auth/setUser", null, { root: true });
        store.commit("auth/setApiIsSuccess", null, { root: true });
    });

    describe("API request succeeded", () => {
        it("registerアクションによりstateに正しく値が保存されるか", async done => {
            const post = jest.fn().mockImplementation(() => ({
                data: {
                    name: data.name,
                    email: data.email,
                    id: 1,
                },
                status: CREATED,
            }));

            Test.mockAxios(null, post);
            await Test.testStateWithAction("auth/register", "user", {
                email: data.email,
                id: expect.anything(),
                name: data.name,
            });
            expect(post).toHaveBeenCalled();
            done();
        });

        it("loginアクションによりstateに正しく値が保存されるか", async done => {
            const post = jest.fn().mockImplementation(() => ({
                data: {
                    name: "testuser",
                    email: data.email,
                    id: 1,
                },
                status: OK,
            }));

            Test.mockAxios(null, post);
            await Test.testStateWithAction("auth/login", "user", {
                email: data.email,
                id: expect.anything(),
                name: "testuser",
            });
            expect(post).toHaveBeenCalled();
            done();
        });

        it("logoutアクションによりstateに正しく値が保存されるか", async done => {
            const post = jest.fn().mockImplementation(() => ({ status: OK }));

            Test.mockAxios(null, post);
            await Test.testStateWithAction("auth/logout", "user", null);
            expect(post).toHaveBeenCalled();
            done();
        });

        it("getUserアクションによりセッションがログイン済みのものであればstate.userにユーザー情報が保存されるか", async done => {
            const get = jest.fn().mockImplementation(() => ({
                data: {
                    name: "test",
                    email: "test@example.com",
                    id: 1,
                },
                status: OK,
            }));

            Test.mockAxios(get, null);
            await Test.testStateWithAction("auth/getCurrentUser", "user", {
                name: "test",
                email: "test@example.com",
                id: expect.anything(),
            });
            expect(get).toHaveBeenCalled();
            done();
        });

        it("getUserアクションによりセッションが未ログインのものであればstate.userにnullが保存されるか", async done => {
            const get = jest.fn().mockImplementation(() => ({
                data: [],
                status: OK,
            }));

            Test.mockAxios(get, null);
            await Test.testStateWithAction("auth/getCurrentUser", "user", null);
            expect(get).toHaveBeenCalled();
            done();
        });
    });

    describe("API request failed with status code 500", () => {
        const post = () => ({ status: INTERNAL_SERVER_ERROR });
        const get = () => ({ status: INTERNAL_SERVER_ERROR });

        const checkApiIsFailure = async action => {
            expect(store.state.auth.user).toBe(null);
            await Test.testApiResult(`auth/${action}`, false);
            expect(store.state.auth.user).toBe(null);
        };

        const checkSpyIsCalled = action => {
            TestUtils.checkSpyIsCalled(
                setErrorCode,
                [{}, INTERNAL_SERVER_ERROR],
                () => Test.testApiResult(`auth/${action}`, false)
            );
        };
        beforeEach(() => {
            Test.mockAxios(get, post);
        });

        describe("register アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await checkApiIsFailure("register");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await checkSpyIsCalled("register");
                await done();
            });
        });

        describe("login アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await checkApiIsFailure("login");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await checkSpyIsCalled("login");
                done();
            });
        });

        describe("logout アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await checkApiIsFailure("logout");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await checkSpyIsCalled("logout");
                done();
            });
        });

        describe("getCurrentUser アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                await checkApiIsFailure("getCurrentUser");
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                await checkSpyIsCalled("getCurrentUser");
                done();
            });
        });
    });

    describe("API request failed with status code 422", () => {
        let validationErrorMessage = null;
        beforeEach(() => {
            validationErrorMessage = {
                name: [randomStr(), randomStr()],
                email: [randomStr(), randomStr()],
                password: [randomStr(), randomStr()],
            };
        });

        const checkApiIsFailure = async (action, target) => {
            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth[target]).toBe(null);
            await Test.testApiResult(`auth/${action}`, false);
            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth[target]).toEqual(validationErrorMessage);
        };

        it("register アクションに422エラーで失敗した時registerErorrMessageに正しく値が保存されるか", async done => {
            const post = () => ({
                data: {
                    errors: validationErrorMessage,
                },
                status: UNPROCESSABLE_ENTITY,
            });
            Test.mockAxios(null, post);
            await checkApiIsFailure("register", "registerValidationMessage");
            done();
        });

        it("login アクションに422エラーで失敗した時loginErrorMessageに正しく値が保存されるか", async done => {
            delete validationErrorMessage.name;
            const post = () => ({
                data: {
                    errors: validationErrorMessage,
                },
                status: UNPROCESSABLE_ENTITY,
            });
            Test.mockAxios(null, post);
            await checkApiIsFailure("login", "loginValidationMessage");
            done();
        });
    });
});

describe("auth.js getters", () => {
    describe("authenticated", () => {
        const user = {
            id: 1,
            name: "testuser",
            email: "test@example.com",
        };
        beforeEach(() => {
            store.commit("auth/setUser", user);
        });

        it("ログイン済のとき、isAuthenticatedゲッターにより正しい値を取得できるか", () => {
            const isLogin = Test.testedGetter("auth/isAuthenticated");
            expect(isLogin).toBe(true);
        });

        it("ログイン済のとき、usernameゲッターにより正しい値を取得できるか", () => {
            const username = Test.testedGetter("auth/username");
            expect(username).toBe(user.name);
        });
    });

    describe("not authenticated", () => {
        beforeEach(() => {
            store.commit("auth/setUser", null);
        });

        it("未ログインのとき、isAuthenticatedゲッターにより正しい値を取得できるか", () => {
            const isLogin = Test.testedGetter("auth/isAuthenticated");
            expect(isLogin).toBe(false);
        });

        it("未ログインのとき、usernameゲッターにより正しい値を取得できるか", () => {
            const username = Test.testedGetter("auth/username");
            expect(username).toBe("");
        });
    });
});
