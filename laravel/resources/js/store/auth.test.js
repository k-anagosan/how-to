import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";
import { randomStr } from "@/utils";

import auth from "@/store/auth";

const localVue = createLocalVue();
localVue.use(Vuex);

let action = null;
const testedAction = (context = {}, payload = {}) =>
    auth.actions[action](context, payload);

describe("store/auth.js actions", () => {
    let store = null;
    let commit = null;
    let state = null;
    let windowSpy = null;
    let originalWindow = null;

    beforeEach(() => {
        store = new Vuex.Store(auth);
        [commit, state] = [store.commit, store.state];
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
