import { OK, CREATED, UNPROCESSABLE_ENTITY, hasProperty } from "../utils";

const state = {
    apiIsSuccess: null,
    postValidationMessage: null,
    photoValidationMessage: null,
};

const getters = {
    allErrors: state => {
        const titleMessage = hasProperty(state.postValidationMessage, "title") ? state.postValidationMessage.title : [];
        const contentMessage = hasProperty(state.postValidationMessage, "content")
            ? state.postValidationMessage.content
            : [];
        const photoMessage = hasProperty(state.photoValidationMessage, "photo")
            ? state.photoValidationMessage.photo
            : [];

        return [...titleMessage, ...contentMessage, ...photoMessage];
    },
};

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
            context.commit("error/setErrorCode", response.status, { root: true });
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
            context.commit("error/setErrorCode", response.status, { root: true });
        }
        context.commit("setApiIsSuccess", false);
        return null;
    },
    async getArticle(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get(`/api/post/${data}`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            return response.data;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
        return null;
    },
    async getArticleList(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get(`/api/posts/?page=${data}`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            return response.data;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
        return null;
    },
    async putLike(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.put(`/api/post/${data}/like`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            return response.data.post_id;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
        return null;
    },

    async deleteLike(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.delete(`/api/post/${data}/unlike`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            return response.data.post_id;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
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
