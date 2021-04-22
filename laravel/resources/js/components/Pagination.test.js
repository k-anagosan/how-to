import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";
import Pagination from "@/components/Pagination.vue";

const Test = new TestUtils();

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

const options = {
    propsData: {
        pagination: paginationFactory(current_page, per_page, last_page),
        to: "/",
    },
    stubs: {
        RouterLink: RouterLinkStub,
        "ion-icon": true,
    },
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(Pagination, options);
    Test.setVueRouter();
    wrapper = Test.shallowWrapperFactory();
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
        expect(wrapper.find(".current_page").text()).toBe(`${current_page} / ${last_page}`);
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

describe.each([["left-button"], ["right-button"]])("Vue Router 関連", button => {
    let current_page = 1;
    let path = null;
    beforeEach(() => {
        options.stubs = ["ion-icon"];
        Test.setMountOption(Pagination, options);
        wrapper = Test.wrapperFactory();
        if (button === "left-button") {
            current_page = 2;
        }
        path = button === "left-button" ? `/?page=${current_page - 1}` : `/?page=${current_page + 1}`;
    });

    it("%s RouterLinkのtoに正しいページのurlが設定される", async done => {
        await wrapper.setProps({ pagination: { ...options.propsData.pagination, current_page } });
        expect(wrapper.find(`.${button}`).props().to).toBe(path);
        done();
    });
    it("%s をクリックしたら正しいページへ飛ぶ", async done => {
        await wrapper.setProps({ pagination: { ...options.propsData.pagination, current_page } });
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.find(`.${button}`).trigger("click");
        expect(wrapper.vm.$route.fullPath).toBe(path);
        done();
    });
});
