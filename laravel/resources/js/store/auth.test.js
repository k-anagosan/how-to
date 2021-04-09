import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";
import {
    randomStr,
    OK,
    CREATED,
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY,
} from "@/utils";

import auth from "@/store/auth";

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
            auth,
            error,
        },
    });
});

const testedAction = (action, payload = {}) =>
    store.dispatch(`auth/${action}`, payload);

describe("auth.js actions", () => {
    let windowSpy = null;
    let originalWindow = null;

    beforeEach(() => {
        originalWindow = { ...window };
        windowSpy = jest.spyOn(global, "window", "get");
    });
    afterEach(() => {
        windowSpy.mockRestore();
        store.commit("auth/setUser", null, { root: true });
        store.commit("auth/setApiIsSuccess", null, { root: true });
    });

    describe("API request succeeded", () => {
        it("registerアクションによりstateに正しく値が保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: (url, data) => ({
                        data: {
                            name: data.name,
                            email: data.email,
                            id: 1,
                        },
                        status: CREATED,
                    }),
                },
            }));

            const data = {
                name: randomStr(),
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
                password_confirmation: "password",
            };

            await testedAction("register", data);

            expect(store.state.auth.user).toEqual({
                email: data.email,
                id: expect.anything(),
                name: data.name,
            });
            expect(store.state.auth.apiIsSuccess).toBe(true);
            done();
        });

        it("loginアクションによりstateに正しく値が保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: (url, data) => ({
                        data: {
                            name: "testuser",
                            email: data.email,
                            id: 1,
                        },
                        status: OK,
                    }),
                },
            }));

            const data = {
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
            };

            await testedAction("login", data);

            expect(store.state.auth.user).toEqual({
                email: data.email,
                id: expect.anything(),
                name: "testuser",
            });
            expect(store.state.auth.apiIsSuccess).toBe(true);
            done();
        });

        it("logoutアクションによりstateに正しく値が保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: () => ({ status: OK }),
                },
            }));

            await testedAction("logout");

            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(true);
            done();
        });

        it("getUserアクションによりセッションがログイン済みのものであればstate.userにユーザー情報が保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    get: () => ({
                        data: {
                            name: "test",
                            email: "test@example.com",
                            id: 1,
                        },
                        status: OK,
                    }),
                },
            }));

            await testedAction("getCurrentUser");

            expect(store.state.auth.user).toEqual({
                name: "test",
                email: "test@example.com",
                id: expect.anything(),
            });
            expect(store.state.auth.apiIsSuccess).toBe(true);
            done();
        });

        it("getUserアクションによりセッションが未ログインのものであればstate.userにnullが保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    get: () => ({
                        data: [],
                        status: OK,
                    }),
                },
            }));

            await testedAction("getCurrentUser");

            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(true);
            done();
        });
    });

    describe("API request failed with status code 500", () => {
        let data = null;
        beforeEach(() => {
            setErrorCode.mock.calls = [];
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: () => ({
                        status: INTERNAL_SERVER_ERROR,
                    }),
                    get: () => ({
                        status: INTERNAL_SERVER_ERROR,
                    }),
                },
            }));
        });

        describe("register アクションでリクエストに失敗", () => {
            data = {
                name: randomStr(),
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
                password_confirmation: "password",
            };
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(null);
                await testedAction("register", data);

                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                expect(setErrorCode).toHaveBeenCalledTimes(0);
                await testedAction("register", data);
                expect(setErrorCode).toHaveBeenCalledTimes(1);
                expect(setErrorCode.mock.calls[0][1]).toBe(
                    INTERNAL_SERVER_ERROR
                );
                done();
            });
        });

        describe("login アクションでリクエストに失敗", () => {
            data = {
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
            };
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(null);
                await testedAction("login", data);

                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                expect(setErrorCode).toHaveBeenCalledTimes(0);
                await testedAction("login", data);
                expect(setErrorCode).toHaveBeenCalledTimes(1);
                expect(setErrorCode.mock.calls[0][1]).toBe(
                    INTERNAL_SERVER_ERROR
                );
                done();
            });
        });

        describe("logout アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(null);
                await testedAction("logout");

                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                expect(setErrorCode).toHaveBeenCalledTimes(0);
                await testedAction("logout");
                expect(setErrorCode).toHaveBeenCalledTimes(1);
                expect(setErrorCode.mock.calls[0][1]).toBe(
                    INTERNAL_SERVER_ERROR
                );
                done();
            });
        });

        describe("getCurrentUser アクションでリクエストに失敗", () => {
            it("apiIsSuccessに正しく値が保存されるか", async done => {
                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(null);
                await testedAction("getCurrentUser");

                expect(store.state.auth.user).toBe(null);
                expect(store.state.auth.apiIsSuccess).toBe(false);
                done();
            });

            it("errorストアのsetErrorCodeが呼び出されるか", async done => {
                expect(setErrorCode).toHaveBeenCalledTimes(0);
                await testedAction("getCurrentUser");
                expect(setErrorCode).toHaveBeenCalledTimes(1);
                expect(setErrorCode.mock.calls[0][1]).toBe(
                    INTERNAL_SERVER_ERROR
                );
                done();
            });
        });
    });

    describe("API request failed with status code 422", () => {
        let data = null;
        let validationErrorMessage = null;
        beforeEach(() => {
            validationErrorMessage = {
                name: [randomStr(), randomStr()],
                email: [randomStr(), randomStr()],
                password: [randomStr(), randomStr()],
            };
        });

        it("register アクションに422エラーで失敗した時registerErorrMessageに正しく値が保存されるか", async done => {
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: () => ({
                        status: UNPROCESSABLE_ENTITY,
                        data: {
                            errors: validationErrorMessage,
                        },
                    }),
                },
            }));

            data = {
                name: randomStr(),
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
                password_confirmation: "password",
            };
            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(null);
            expect(store.state.auth.registerValidationMessage).toBe(null);
            await testedAction("register", data);

            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(false);
            expect(store.state.auth.registerValidationMessage).toEqual(
                validationErrorMessage
            );
            done();
        });

        it("login アクションに422エラーで失敗した時loginErrorMessageに正しく値が保存されるか", async done => {
            delete validationErrorMessage.name;
            windowSpy.mockImplementation(() => ({
                ...originalWindow,
                axios: {
                    post: () => ({
                        status: UNPROCESSABLE_ENTITY,
                        data: {
                            errors: validationErrorMessage,
                        },
                    }),
                },
            }));

            data = {
                email: `${randomStr()}@${randomStr()}.com`,
                password: "password",
            };
            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(null);
            expect(store.state.auth.loginValidationMessage).toBe(null);
            await testedAction("login", data);

            expect(store.state.auth.user).toBe(null);
            expect(store.state.auth.apiIsSuccess).toBe(false);
            expect(store.state.auth.loginValidationMessage).toBe(
                validationErrorMessage
            );
            done();
        });
    });
});

describe("auth.js getters", () => {
    const testedGetter = getter => store.getters[`auth/${getter}`];
    const state = { store };

    describe("authenticated", () => {
        beforeEach(() => {
            store.commit("auth/setUser", {
                id: 1,
                name: "testuser",
                email: "test@example.com",
            });
        });

        afterEach(() => {});

        it("ログイン済のとき、isAuthenticatedゲッターにより正しい値を取得できるか", () => {
            const isLogin = testedGetter("isAuthenticated", state);

            expect(isLogin).toBe(true);
        });

        it("ログイン済のとき、usernameゲッターにより正しい値を取得できるか", () => {
            const username = testedGetter("username", state);

            expect(username).toBe("testuser");
        });
    });

    describe("not authenticated", () => {
        beforeEach(() => {
            store.commit("auth/setUser", null);
        });

        it("未ログインのとき、isAuthenticatedゲッターにより正しい値を取得できるか", () => {
            const isLogin = testedGetter("isAuthenticated", state);

            expect(isLogin).toBe(false);
        });

        it("未ログインのとき、usernameゲッターにより正しい値を取得できるか", () => {
            const username = testedGetter("username", state);

            expect(username).toBe("");
        });
    });
});
