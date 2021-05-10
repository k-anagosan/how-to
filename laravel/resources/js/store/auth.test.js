import TestUtils from "@/testutils";
import { randomStr, OK, CREATED, INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from "@/utils";

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
    const res = {
        data: {
            name: randomStr(),
            email: `${randomStr()}@${randomStr()}.com`,
            id: 1,
        },
        status: OK,
    };
    const expected = {
        name: res.data.name,
        email: res.data.email,
        id: expect.anything(),
    };

    afterEach(() => {
        store.commit("auth/setUser", null, { root: true });
        store.commit("auth/setApiIsSuccess", null, { root: true });
    });

    describe("API request succeeded", () => {
        it.each([
            ["auth/register", res, "register", expected],
            ["auth/login", res, "login", expected],
            ["auth/logout", { status: OK }, "logout", null],
            ["ログイン時auth/getCurrentUser", res, "getCurrentUser", expected],
            ["未ログイン時auth/getCurrentUser", { data: [], status: OK }, "getCurrentUser", null],
        ])("%sによりstateに正しく値が保存される", async (_, res, action, expected) => {
            if (action === "register") {
                res.status = CREATED;
            } else {
                res.status = OK;
            }

            let [get, post] = [null, null];
            if (action === "getCurrentUser") {
                get = jest.fn().mockImplementation(() => res);
            } else {
                post = jest.fn().mockImplementation(() => res);
            }
            Test.mockAxios(get, post);

            await Test.testStateWithAction(`auth/${action}`, "user", expected);
            expect(post ?? get).toHaveBeenCalled();
        });

        it.each([
            ["putFollow", "フォローAPIが実行されるか", OK],
            ["deleteFollow", "フォロー解除APIが実行されるか", OK],
        ])("%sにより%s", async (action, _, status) => {
            const data = { user_id: 1 };
            const res = jest.fn().mockImplementation(() => ({ data, status }));

            Test.mockAxios(null, null, res, res);

            await Test.testedAction(`auth/${action}`, 1);
            res.mock.calls = [];
        });
    });

    describe("API request failed with status code 500", () => {
        const res = () => ({ status: INTERNAL_SERVER_ERROR });

        const checkApiIsFailure = async action => {
            expect(store.state.auth.user).toBe(null);
            await Test.testApiResult(`auth/${action}`, false);
            expect(store.state.auth.user).toBe(null);
        };

        const checkSpyIsCalled = action => {
            TestUtils.checkSpyIsCalled(setErrorCode, [{}, INTERNAL_SERVER_ERROR], () =>
                Test.testApiResult(`auth/${action}`, false)
            );
        };
        beforeEach(() => {
            Test.mockAxios(res, res, res, res);
        });

        describe.each([["register"], ["login"], ["logout"], ["getCurrentUser"], ["putFollow"], ["deleteFollow"]])(
            "%sアクションでリクエストに失敗",
            action => {
                it("apiIsSuccessに正しく値が保存されるか", async done => {
                    await checkApiIsFailure(action);
                    done();
                });
                it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                    await checkSpyIsCalled(action);
                    done();
                });
            }
        );
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

        it.each([["register"], ["login"]])(
            "%sアクションに422エラーで失敗した時%sErorrMessageに正しく値が保存されるか",
            async action => {
                if (action === "login") delete validationErrorMessage.name;
                const post = () => ({
                    data: {
                        errors: validationErrorMessage,
                    },
                    status: UNPROCESSABLE_ENTITY,
                });
                Test.mockAxios(null, post);
                await checkApiIsFailure(action, `${action}ValidationMessage`);
            }
        );
    });
});

describe("auth.js getters", () => {
    const user = {
        id: 1,
        name: "testuser",
        email: "test@example.com",
    };
    const loginValidationMessage = {
        email: [randomStr()],
        password: [randomStr()],
    };
    const loginErrors = [...loginValidationMessage.email, ...loginValidationMessage.password];
    const registerValidationMessage = {
        name: [randomStr()],
        email: [randomStr()],
        password: [randomStr(), randomStr()],
    };
    const registerErrors = [
        ...registerValidationMessage.name,
        ...registerValidationMessage.email,
        ...registerValidationMessage.password,
    ];

    beforeEach(() => {
        store.commit("auth/setLoginValidationMessage", loginValidationMessage);
        store.commit("auth/setRegisterValidationMessage", registerValidationMessage);
    });

    describe.each([
        ["ログイン済み", true],
        ["未ログイン", false],
    ])("%s", (describe, isAuth) => {
        beforeEach(() => {
            store.commit("auth/setUser", isAuth ? user : null);
        });

        it(`${describe}のとき、isAuthenticatedゲッターにより正しい値を取得できるか`, () => {
            const isLogin = Test.testedGetter("auth/isAuthenticated");
            expect(isLogin).toBe(isAuth);
        });

        it(`${describe}のとき、usernameゲッターにより正しい値を取得できるか`, () => {
            const username = Test.testedGetter("auth/username");
            expect(username).toBe(isAuth ? user.name : "");
        });
    });

    it.each([
        ["registerErrors", registerErrors],
        ["loginErrors", loginErrors],
    ])("%sゲッターにより正しい値を取得できるか", (getter, messages) => {
        const errors = Test.testedGetter(`auth/${getter}`);
        expect(errors).toEqual(messages);
    });
});
