import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";
import { randomStr, OK, CREATED } from "@/utils";

import auth from "@/store/auth";
import error from "@/store/error";

const localVue = createLocalVue();
localVue.use(Vuex);

let store = null;

beforeEach(() => {
    store = new Vuex.Store({ modules: { auth, error } });
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
    });

    it("registerアクションによりstate.userに正しく値が保存されるか", async done => {
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
        done();
    });

    it("loginアクションによりstate.userに正しく値が保存されるか", async done => {
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
        done();
    });

    it("logoutアクションによりstate.userに正しく値が保存されるか", async done => {
        windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: {
                post: () => ({ status: OK }),
            },
        }));

        await testedAction("logout");

        expect(store.state.auth.user).toBe(null);
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
        done();
    });

    it("getUserアクションによりセッションが未ログインのものであればstate.userにnullが保存されるか", async done => {
        windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: {
                get: () => ({
                    data: "",
                    status: OK,
                }),
            },
        }));

        await testedAction("getCurrentUser");

        expect(store.state.auth.user).toBe(null);
        done();
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

        it("ログイン済のとき、usernameゲッターにより正しい値を取得できるか", () => {
            const username = testedGetter("username", state);

            expect(username).toBe("");
        });
    });
});
