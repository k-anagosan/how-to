import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import Vue from "vue";
import VueRouter from "vue-router";
import Vuex from "vuex";

class TestUtils {
    /**
     * マウント対象のコンポーネントとマウンティングオプションをセットする
     *
     * @param {*} Component
     * @param {*} options
     */
    setMountOption(Component, options) {
        this.Component = Component;
        this.options = { ...options };
        this.localVue = createLocalVue();
    }

    /**
     * VurRouterをoptionsにセットする
     *
     * @param {Object} routes
     */
    setVueRouter(routes) {
        const router = new VueRouter({
            routes: { ...routes },
            mode: "history",
        });

        this.localVue.use(VueRouter);

        this.options = {
            ...this.options,
            localVue: this.localVue,
            router,
        };
    }

    /**
     * Vuexをoptionsにセットする
     *
     * @param {Object} modules
     */
    setVuex(modules) {
        const store = this.createVuexStore(modules);

        this.localVue.use(Vuex);

        this.options = {
            ...this.options,
            localVue: this.localVue,
            store,
        };
    }

    /**
     * Vuexストアのみを生成する
     *
     * @param {*} modules
     * @return {*}
     */
    createVuexStore(modules) {
        Vue.use(Vuex);
        this.store = new Vuex.Store({ modules: { ...modules } });
        return this.store;
    }

    /**
     * axiosをモックする
     *
     * @param {*} get
     * @param {*} post
     */
    mockAxios(get, post) {
        const originalWindow = { ...window };
        this.windowSpy = jest.spyOn(global, "window", "get");
        this.windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: { get, post },
        }));
    }

    /**
     * axiosのモックを解除する
     */
    restoreAxios() {
        if (this.windowSpy) this.windowSpy.mockRestore();
    }

    /**
     * スパイファンクションをセットする
     */
    setSpys(...spys) {
        this.spys = spys;
    }

    /**
     * セットされているスパイファンクションの呼び出し履歴をクリアにする
     */
    clearSpysCalledTimes() {
        this.spys.forEach(spy => {
            spy.mock.calls = [];
        });
    }

    /**
     * セットされているスパイファンクションがすべて呼び出されているかチェックする
     */
    checkSpysHaveBeenCalled() {
        this.spys.forEach(spy => {
            expect(spy).toHaveBeenCalled();
        });
    }

    /**
     * セットされているスパイファンクションがすべてまだ呼び出されていないかチェックする
     */
    checkSpysHaveNotBeenCalled() {
        this.spys.forEach(spy => {
            expect(spy).not.toHaveBeenCalled();
        });
    }

    /**
     * shallowMount()によるwrapperを取得する
     *
     * @return {any}
     */
    shallowWrapperFactory() {
        return shallowMount(this.Component, this.options);
    }

    /**
     * mount()によるwrapperを取得する
     *
     * @return {any}
     */
    wrapperFactory() {
        return mount(this.Component, this.options);
    }

    /**
     * コンポーネント内の指定したcomputedを実行して値を取得する
     *
     * @param {String} target
     * @param {Object} options
     * @return {any}
     */
    computedValue(target, options) {
        return this.Component.computed[target].call(options);
    }

    async testedAction(action, payload) {
        if (!this.store) {
            return null;
        }
        const data = await this.store.dispatch(action, payload);
        return data;
    }

    testedGetter(getter) {
        return this.store.getters[`${getter}`];
    }
}

export default TestUtils;
