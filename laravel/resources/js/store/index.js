import Vue from "vue";
import Vuex from "vuex";

import userpage from "./userpage";
import auth from "./auth";
import error from "./error";
import post from "./post";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        error,
        post,
        userpage,
    },
});
