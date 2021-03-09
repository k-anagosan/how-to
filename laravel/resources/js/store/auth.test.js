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

describe("store/auth.js", () => {
    let store = null;
    let windowSpy = null;
    beforeEach(() => {
        store = new Vuex.Store(auth);

        const originalWindow = { ...window };
        windowSpy = jest.spyOn(global, "window", "get");
        windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: {
                post: (url, data) => {
                    const name = data.name ?? "testuser";
                    return {
                        data: {
                            name,
                            email: data.email,
                            id: 1,
                        },
                    };
                },
            },
        }));
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    describe("actions", () => {
        let commit = null;
        let state = null;

        beforeEach(() => {
            [commit, state] = [store.commit, store.state];
        });

        it("registerアクションによりstate.userに正しく値が保存されるか", async done => {
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
    });
});
