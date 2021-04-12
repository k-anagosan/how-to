import {
    mount,
    shallowMount,
    createLocalVue,
    RouterLinkStub,
} from "@vue/test-utils";
import Pagination from "@/components/Pagination.vue";
import VueRouter from "vue-router";

const localVue = createLocalVue();
localVue.use(VueRouter);

const { current_page, per_page, last_page } = {
    current_page: 1,
    per_page: 4,
    last_page: 3,
};

const paginationFactory = (current_page, per_page, last_page) => ({
    current_page,
    per_page,
    last_page,
});

const router = new VueRouter({ mode: "history" });

const options = {
    router,
    localVue,
    stubs: {
        RouterLink: RouterLinkStub,
        "ion-icon": true,
    },
    propsData: {
        pagination: paginationFactory(current_page, per_page, last_page),
    },
};

const factory = options => shallowMount(Pagination, options);

let wrapper = null;

beforeEach(() => {
    wrapper = factory(options);
});

afterEach(() => {
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it("現在ページ数と総ページ数が'x / y'の形式で表示される", async done => {
        const current_page = 2;
        await wrapper.setProps({
            pagination: { ...options.propsData.pagination, current_page },
        });
        expect(wrapper.find(".current_page").text()).toBe(
            `${current_page} / ${last_page}`
        );
        done();
    });

    it("1ページ目ならleft-buttonが非表示になる", () => {
        expect(wrapper.find(".left-button").exists()).toBe(false);
        expect(wrapper.find(".right-button").exists()).toBe(true);
    });

    it("1ページ目と最終ページでなければleft-buttonとright-buttonが表示される", async done => {
        const current_page = 2;
        await wrapper.setProps({
            pagination: { ...options.propsData.pagination, current_page },
        });
        expect(wrapper.find(".left-button").exists()).toBe(true);
        expect(wrapper.find(".right-button").exists()).toBe(true);
        done();
    });

    it("最終ページならright-buttonが非表示になる", async done => {
        await wrapper.setProps({
            pagination: {
                ...options.propsData.pagination,
                current_page: last_page,
            },
        });
        expect(wrapper.find(".left-button").exists()).toBe(true);
        expect(wrapper.find(".right-button").exists()).toBe(false);
        done();
    });
});

describe("Vue Router 関連", () => {
    const noneRouterLinkStub = { ...options };
    delete noneRouterLinkStub.stubs.RouterLink;
    beforeEach(() => {
        wrapper = mount(Pagination, noneRouterLinkStub);
    });

    it("left-button RouterLinkのtoに前ページへのurlが設定される", async done => {
        const current_page = 2;
        await wrapper.setProps({
            pagination: {
                ...noneRouterLinkStub.propsData.pagination,
                current_page,
            },
        });
        expect(wrapper.find(".left-button").props().to).toBe(
            `/?page=${current_page - 1}`
        );
        done();
    });
    it("left-button をクリックしたら前ページへ飛ぶ", async done => {
        const current_page = 2;
        await wrapper.setProps({
            pagination: {
                ...noneRouterLinkStub.propsData.pagination,
                current_page,
            },
        });
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.find(".left-button").trigger("click");
        expect(wrapper.vm.$route.fullPath).toBe(`/?page=${current_page - 1}`);
        done();
    });
    it("right-button RouterLinkのtoに次ページへのurlが設定される", () => {
        expect(wrapper.find(".right-button").props().to).toBe(
            `/?page=${current_page + 1}`
        );
    });
    it("right-button をクリックしたら次ページへ飛ぶ", async done => {
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.find(".right-button").trigger("click");
        expect(wrapper.vm.$route.fullPath).toBe(`/?page=${current_page + 1}`);
        done();
    });
});
