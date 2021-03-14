import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import { INTERNAL_SERVER_ERROR } from "@/utils";

import error from "@/store/error";

const localVue = createLocalVue();
localVue.use(Vuex);

let store = null;

beforeEach(() => {
    store = new Vuex.Store(error);
});

afterEach(() => {
    store = null;
});

describe("error.js mutations", () => {
    it("setErrorCodeにより正しく値を保存できるか", () => {
        expect(store.state.errorCode).toBe(null);

        store.commit("setErrorCode", INTERNAL_SERVER_ERROR);

        expect(store.state.errorCode).toBe(INTERNAL_SERVER_ERROR);
    });
});
