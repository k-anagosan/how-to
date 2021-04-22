import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import VueRouter from "vue-router";
import Vuex from "vuex";

class TestUtils {
    constructor() {
        const localVue = createLocalVue();
        localVue.use(Vuex);
        localVue.use(VueRouter);
        this.localVue = localVue;
    }

    /**
     * マウント対象のコンポーネントとマウンティングオプションをセットする
     *
     * @param {*} Component
     * @param {*} options
     */
    setMountOption(Component, options) {
        this.Component = Component;
        this.options = { ...this.options, ...options };
    }

    /**
     * VueRouterを生成してoptionsにセットする
     *
     * @param {Object} routes
     */
    setVueRouter(routes) {
        const routerOption = {
            mode: "history",
        };

        if (Array.isArray(routes)) routerOption.routes = routes;

        const router = new VueRouter(routerOption);

        this.setVueRouterInstance(router);

        return router;
    }

    /**
     * 生成済みVueRouterをセットする
     *
     * @param {*} router
     */
    setVueRouterInstance(router) {
        this.router = router;
        this.options = {
            ...this.options,
            localVue: this.localVue,
            router,
        };
    }

    /**
     * Vuexストアを生成してoptionsにセットする
     *
     * @param {Object} modules
     */
    setVuex(modules) {
        const store = this.createVuexStore(modules);

        this.setVuexInstance(store);

        return store;
    }

    /**
     * 生成済みVuexストアをセットする
     *
     * @param {*} store
     */
    setVuexInstance(store) {
        this.store = store;
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
        this.store = new Vuex.Store({ modules: { ...modules } });
        return this.store;
    }

    /**
     * axiosをモックする
     *
     * @param {*} get
     * @param {*} post
     */
    mockAxios(get, post, put = () => null, _delete = () => null) {
        const originalWindow = { ...window };
        this.windowSpy = jest.spyOn(global, "window", "get");
        this.windowSpy.mockImplementation(() => ({
            ...originalWindow,
            axios: { get, post, put, delete: _delete },
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
    setSpys(spys) {
        this.spys = this.spys ? { ...this.spys, ...spys } : spys;
    }

    /**
     * セットされているスパイファンクションの呼び出し履歴をクリアにする
     */
    clearSpysCalledTimes() {
        Object.keys(this.spys).forEach(key => {
            this.spys[key].mock.calls = [];
        });
    }

    /**
     * セットされているスパイファンクションがすべて呼び出されているかチェックする
     */
    checkSpysHaveBeenCalled() {
        Object.keys(this.spys).forEach(key => {
            expect(this.spys[key]).toHaveBeenCalled();
        });
    }

    static async checkSpyIsCalled(spy, args, callback) {
        expect(spy).not.toHaveBeenCalled();
        await callback();
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0]).toEqual(args);
    }

    static async checkSpysAreCalled(spys, callback) {
        spys.forEach(spy => {
            expect(spy).not.toHaveBeenCalled();
        });
        await callback();
        spys.forEach(spy => {
            expect(spy).toHaveBeenCalled();
        });
    }

    /**
     * セットされているスパイファンクションがすべてまだ呼び出されていないかチェックする
     */
    checkSpysHaveNotBeenCalled() {
        Object.keys(this.spys).forEach(key => {
            expect(this.spys[key]).not.toHaveBeenCalled();
        });
    }

    /**
     * shallowMount()によるwrapperを取得する
     *
     * @return {any}
     */
    shallowWrapperFactory() {
        this.wrapper = shallowMount(this.Component, {
            ...this.options,
        });
        return this.wrapper;
    }

    /**
     * mount()によるwrapperを取得する
     *
     * @return {any}
     */
    wrapperFactory() {
        this.wrapper = mount(this.Component, {
            ...this.options,
        });
        return this.wrapper;
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

    async testRouting(from, to) {
        if (!this.wrapper) return;
        expect(this.wrapper.vm.$route.path).toBe(from);
        if (from === to) return;
        await this.wrapper.vm.$router.push(to).catch(() => {});
        expect(this.wrapper.vm.$route.path).toBe(to);
    }

    async testRoutingWithComponent(from, to, Component) {
        if (!this.wrapper) return;
        expect(this.wrapper.vm.$route.path).toBe(from);
        if (!to || from !== to) await this.wrapper.vm.$router.push(to).catch(() => {});
        expect(this.wrapper.findComponent(Component).exists()).toBe(true);
    }

    async testRedirect(from, to, redirectPath) {
        if (!this.wrapper) return;
        expect(this.wrapper.vm.$route.path).toBe(from);
        if (!to || from !== to) await this.wrapper.vm.$router.push(to).catch(() => {});
        expect(this.wrapper.vm.$route.path).toBe(redirectPath);
    }

    async testApiResponse(moduleAndAction, expected) {
        const receive = await this.testApiResult(moduleAndAction, true);
        expect(receive).toStrictEqual(expected);
    }

    async testApiResult(moduleAndAction, result) {
        const [module] = moduleAndAction.split("/");
        expect(this.store.state[module].apiIsSuccess).toBe(null);
        const receive = await this.testedAction(`${moduleAndAction}`, {});
        expect(this.store.state[module].apiIsSuccess).toBe(result);
        return receive;
    }

    async testStateWithAction(moduleAndAction, target, expected) {
        await this.testApiResult(moduleAndAction, true);
        const [module] = moduleAndAction.split("/");
        expect(this.store.state[module][target]).toStrictEqual(expected);
    }
}

export default TestUtils;
