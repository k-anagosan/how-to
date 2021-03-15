const state = {
    errorCode: null,
};

const mutations = {
    setErrorCode(state, errorCode) {
        state.errorCode = errorCode;
    },
};

export default {
    namespaced: true,
    state,
    mutations,
};
