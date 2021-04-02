import { CREATED, UNPROCESSABLE_ENTITY } from "../utils";

const state = {
    apiIsSuccess: null,
    postValidationMessage: null,
    photoValidationMessage: null,
};

const getters = null;

const mutations = {
    setApiIsSuccess(state, isSuccess) {
        state.apiIsSuccess = isSuccess;
    },
    setPostValidationMessage(state, message) {
        state.postValidationMessage = message;
    },
    setPhotoValidationMessage(state, message) {
        state.photoValidationMessage = message;
    },
};

const actions = {
    async postItem(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.post("/api/post", data);

        if (response.status === CREATED) {
            context.commit("setApiIsSuccess", true);
            return response.data.post_id;
        }

        if (response.status === UNPROCESSABLE_ENTITY) {
            context.commit("setPostValidationMessage", response.data.errors);
        } else {
            context.commit("error/setErrorCode", response.status, {
                root: true,
            });
        }
        context.commit("setApiIsSuccess", false);
        return null;
    },
    async postPhoto(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.post("/api/photo", data);

        if (response.status === CREATED) {
            context.commit("setApiIsSuccess", true);
            return response.data.filename;
        }

        if (response.status === UNPROCESSABLE_ENTITY) {
            context.commit("setPhotoValidationMessage", response.data.errors);
        } else {
            context.commit("error/setErrorCode", response.status, {
                root: true,
            });
        }
        context.commit("setApiIsSuccess", false);
        return null;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
