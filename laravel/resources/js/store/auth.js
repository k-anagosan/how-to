import { OK, CREATED, UNPROCESSABLE_ENTITY, hasProperty } from "../utils";

const state = {
    user: null,
    apiIsSuccess: null,
    loginValidationMessage: null,
    registerValidationMessage: null,
};

const getters = {
    isAuthenticated: state => Boolean(state.user),
    username: state => (state.user ? state.user.name : ""),
    registerErrors: state => {
        const nameMessage = hasProperty(state.registerValidationMessage, "name")
            ? state.registerValidationMessage.name
            : [];
        const emailMessage = hasProperty(state.registerValidationMessage, "email")
            ? state.registerValidationMessage.email
            : [];
        const passwordMessage = hasProperty(state.registerValidationMessage, "password")
            ? state.registerValidationMessage.password
            : [];

        return [...nameMessage, ...emailMessage, ...passwordMessage];
    },
    loginErrors: state => {
        const emailMessage = hasProperty(state.loginValidationMessage, "email")
            ? state.loginValidationMessage.email
            : [];
        const passwordMessage = hasProperty(state.loginValidationMessage, "password")
            ? state.loginValidationMessage.password
            : [];

        return [...emailMessage, ...passwordMessage];
    },
};

const mutations = {
    setUser(state, user) {
        state.user = user;
    },
    setApiIsSuccess(state, isSuccess) {
        state.apiIsSuccess = isSuccess;
    },
    setLoginValidationMessage(state, message) {
        state.loginValidationMessage = message;
    },
    setRegisterValidationMessage(state, message) {
        state.registerValidationMessage = message;
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

        if (response.status === UNPROCESSABLE_ENTITY) {
            context.commit("setRegisterValidationMessage", response.data.errors);
        } else {
            context.commit("error/setErrorCode", response.status, {
                root: true,
            });
        }

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

        if (response.status === UNPROCESSABLE_ENTITY) {
            context.commit("setLoginValidationMessage", response.data.errors);
        } else {
            context.commit("error/setErrorCode", response.status, {
                root: true,
            });
        }

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

        if (response.status === OK) {
            const user = Object.keys(response.data).length > 0 ? response.data : null;
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
