import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import "@/bootstrap";

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
                post: (url, data) => ({
                    data: {
                        name: data.name,
                        email: data.email,
                        id: 1,
                    },
                }),
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
            await testedAction(
                { commit, state },
                {
                    name: "test",
                    email: "test@email.com",
                    password: "password",
                    password_confirmation: "password",
                }
            );
            expect(store.state.user).toEqual({
                email: "test@email.com",
                id: expect.anything(),
                name: "test",
            });
            done();
        });
    });
});
