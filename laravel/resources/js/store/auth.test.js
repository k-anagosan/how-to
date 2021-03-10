import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";
import { randomStr } from "@/utils";

import auth from "@/store/auth";

const localVue = createLocalVue();
localVue.use(Vuex);

let store = null;
let commit = null;
let state = null;

beforeEach(() => {
    store = new Vuex.Store(auth);
    [commit, state] = [store.commit, store.state];
});

describe("auth.js actions", () => {
    let windowSpy = null;
    let originalWindow = null;

    let action = null;
    const testedAction = (context = {}, payload = {}) =>
        auth.actions[action](context, payload);

    beforeEach(() => {
        originalWindow = { ...window };
        windowSpy = jest.spyOn(global, "window", "get");
    });
    afterEach(() => {
        windowSpy.mockRestore();
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
                }),
            },
        }));

        action = "register";
        const data = {
            name: randomStr(),
            email: `${randomStr()}@${randomStr()}.com`,
            password: "password",
            password_confirmation: "password",
        };

        await testedAction({ commit, state }, data);

        expect(store.state.user).toEqual({
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
                }),
            },
        }));

        action = "login";
        const data = {
            email: `${randomStr()}@${randomStr()}.com`,
            password: "password",
        };

        await testedAction({ commit, state }, data);

        expect(store.state.user).toEqual({
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
                post: () => ({}),
            },
        }));

        action = "logout";

        await testedAction({ commit, state });

        expect(store.state.user).toBe(null);
        done();
    });
});

describe("auth.js getters", () => {
    let getter = null;
    const testedGetter = state => auth.getters[getter](state);

    describe("authenticated", () => {
        beforeEach(() => {
            state.user = {
                id: 1,
                name: "testuser",
                email: "test@example.com",
            };
        });

        it("ログイン済のとき、isAuthenticatedゲッターにより正しい値を取得できるか", async done => {
            getter = "isAuthenticated";
            const isLogin = await testedGetter(state);

            expect(isLogin).toBe(true);
            done();
        });

        it("ログイン済のとき、usernameゲッターにより正しい値を取得できるか", async done => {
            getter = "username";
            const username = await testedGetter(state);

            expect(username).toBe("testuser");
            done();
        });
    });

    describe("not authenticated", () => {
        beforeEach(() => {
            state.user = null;
        });

        it("未ログインのとき、isAuthenticatedゲッターにより正しい値を取得できるか", async done => {
            getter = "isAuthenticated";
            const isLogin = await testedGetter(state);

            expect(isLogin).toBe(false);
            done();
        });

        it("ログイン済のとき、usernameゲッターにより正しい値を取得できるか", async done => {
            getter = "username";
            const username = await testedGetter(state);

            expect(username).toBe("");
            done();
        });
    });
});
