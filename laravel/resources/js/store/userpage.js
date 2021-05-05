import { OK } from "../utils";

const state = {
    articles: null,
    archives: null,
    likes: null,
    followers: null,
    apiIsSuccess: null,
};

const mutations = {
    setApiIsSuccess(state, isSuccess) {
        state.apiIsSuccess = isSuccess;
    },
    setArticles(state, articles) {
        state.articles = articles;
    },
    setArchives(state, archives) {
        state.archives = archives;
    },
    setLikes(state, likes) {
        state.likes = likes;
    },
    setFollowers(state, followers) {
        state.followers = followers;
    },
};

const actions = {
    async getUserPageData(context, name) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get(`/api/user/${name}`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            return response.data;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
        return null;
    },
    async getArticles(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get(`/api/user/${data.name}/articles?page=${data.page}`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            context.commit("setArticles", response.data);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },
    async getLikedArticles(context, data) {
        context.commit("setApiIsSuccess", null);

        const response = await window.axios.get(`/api/user/${data.name}/likes?page=${data.page}`);

        if (response.status === OK) {
            context.commit("setApiIsSuccess", true);
            context.commit("setLikes", response.data);
            return;
        }

        context.commit("error/setErrorCode", response.status, { root: true });
        context.commit("setApiIsSuccess", false);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
