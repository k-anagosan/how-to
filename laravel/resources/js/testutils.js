import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import VueRouter from "vue-router";
import Vuex from "vuex";

class TestComponent {
    /**
     * マウント対象のコンポーネントとマウンティングオプションをセットする
     *
     * @param {*} Component
     * @param {*} options
     */
    setMountOption(Component, options) {
        this.Component = Component;
        this.options = { ...options };
    }

    /**
     * VurRouterをoptionsにセットする
     *
     * @param {Object} routes
     */
    setVueRouter(routes) {
        const localVue = createLocalVue();

        const router = new VueRouter({
            routes: { ...routes },
            mode: "history",
        });

        this.options = {
            ...this.options,
            localVue,
            router,
        };
    }

    /**
     * Vuexをoptionsにセットする
     *
     * @param {Object} modules
     */
    setVuex(modules) {
        const localVue = createLocalVue();

        const store = new Vuex.Store({ modules: { ...modules } });

        this.options = {
            ...this.options,
            localVue,
            store,
        };
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
}

export default TestComponent;
