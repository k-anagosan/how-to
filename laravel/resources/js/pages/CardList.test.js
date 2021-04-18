import TestUtils from "@/testutils";
import CardList from "@/pages/CardList.vue";
import { randomStr } from "../utils";

const Test = new TestUtils();
const spyFetchArticleList = jest.spyOn(CardList.methods, "fetchArticleList");
Test.setSpys({ spyFetchArticleList });

const article = () => ({
    id: randomStr(20),
    title: randomStr(30),
    content: randomStr(100),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: {
        name: randomStr(10),
    },
});
const responseFactory = (current_page, per_page, last_page) => ({
    current_page,
    data: [...Array(per_page)].map(article),
    per_page,
    last_page,
});

const { current_page, per_page, last_page } = {
    current_page: 1,
    per_page: 4,
    last_page: 3,
};

const response = responseFactory(current_page, per_page, last_page);

const post = {
    namespaced: true,
    actions: {
        getArticleList: jest.fn().mockImplementation(() => ({ ...response })),
    },
};

Test.setSpys({ getArticleList: post.actions.getArticleList });

Test.setVueRouter();
Test.setVuex({ post });

const options = {
    propsData: {
        page: current_page,
    },
    stubs: {
        "ion-icon": true,
    },
};

let wrapper = null;
beforeEach(() => {
    Test.checkSpysHaveNotBeenCalled();
    Test.setMountOption(CardList, options);
    wrapper = Test.shallowWrapperFactory();
    Test.checkSpysHaveBeenCalled();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("ページアクセスしたらdataに記事一覧情報が保存される", () => {
        expect(wrapper.vm.$data.list).toEqual(response.data);
    });
    it("ページアクセスしたらdataにページネーション情報が保存される", () => {
        const pagination = { ...response };
        delete pagination.data;
        expect(wrapper.vm.$data.pagination).toEqual(pagination);
    });

    it("dataに記事一覧情報が保存されたら記事一覧が表示される", () => {
        expect(wrapper.findAll("card-stub").length).toBe(per_page);
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#cardlist").exists()).toBe(!isShown);
    });
});

describe("Vuex", () => {
    it("ページアクセスしたらgetArticleListが実行される", async done => {
        await wrapper.vm.$router.push(`/`).catch(() => {});
        Test.checkSpysHaveBeenCalled();
        done();
    });
});
