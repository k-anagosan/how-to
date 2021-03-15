import { OK, CREATED } from "../utils";

const state = {
    user: null,
    apiIsSuccess: null,
};

const getters = {
    isAuthenticated: state => Boolean(state.user),
    username: state => (state.user ? state.user.name : ""),
};

const mutations = {
    setUser(state, user) {
        state.user = user;
    },
    setApiIsSuccess(state, isSuccess) {
        state.apiIsSuccess = isSuccess;
    },
};

const actions = {
    async register(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.post("/api/register", data);

        if (response.status === CREATED) {
            context.commit("setUser", response.data);
            context.commit("setApiIsSuccess", true);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },

    async login(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.post("/api/login", data);

        if (response.status === OK) {
            context.commit("setUser", response.data);
            context.commit("setApiIsSuccess", true);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },

    async logout(context) {
        context.commit("setApiIsSuccess", null);
        const response = await window.axios.post("/api/logout");

        if (response.status === OK) {
            context.commit("setUser", null);
            context.commit("setApiIsSuccess", true);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },

    async getCurrentUser(context) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get("/api/user");
        const user = response.data || null;

        if (response.status === OK) {
            context.commit("setUser", user);
            context.commit("setApiIsSuccess", true);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
