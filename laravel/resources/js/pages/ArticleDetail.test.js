import TestUtils from "@/testutils";
import ArticleDetail from "@/pages/ArticleDetail.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");
Test.setSpys({ spyFetchArticle });

const response = {
    id: randomStr(20),
    title: randomStr(30),
    content: randomStr(100),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: {
        name: randomStr(10),
    },
};

const post = {
    namespaced: true,
    actions: {
        getArticle: jest.fn().mockImplementation(() => ({ ...response })),
    },
};

Test.setSpys({ getArticle: post.actions.getArticle });
Test.setVueRouter();
Test.setVuex({ post });

const options = {
    propsData: { id: randomStr(20) },
    stubs: {
        "ion-icon": true,
    },
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(ArticleDetail, options);
    wrapper = Test.shallowWrapperFactory();
    Test.clearSpysCalledTimes();
});

describe("表示、入力関連", () => {
    beforeEach(async () => {
        const path = `/article/${randomStr(20)}`;
        await wrapper.vm.$router.push(path);
        expect(wrapper.vm.$route.path).toBe(path);
        expect(spyFetchArticle).toHaveBeenCalled();
    });

    it("ページアクセスしたら記事データを取得できる", () => {
        expect(wrapper.vm.$data.article).toEqual(response);
    });

    it("記事データを取得したらMarkdownPreviewへarticle.contentを渡せる", () => {
        expect(wrapper.find("markdownpreview-stub").props().text).toEqual(response.content);
    });

    it("記事データを取得したらIconへarticle.authorを渡せる", () => {
        wrapper.findAll("icon-stub").wrappers.forEach(wrapper => {
            expect(wrapper.props().icon).toEqual(response.author);
        });
    });

    it("記事データを取得したらIconListへarticle.tagsを渡せる", () => {
        expect(wrapper.find("iconlist-stub").props().icons).toEqual(response.tags);
    });
});

describe("Vuex", () => {
    it("ページアクセスしたらgetArticleアクションが実行される", async done => {
        Test.checkSpysHaveNotBeenCalled();
        await wrapper.vm.$router.push(`/article/${randomStr(20)}`);
        Test.checkSpysHaveBeenCalled();
        done();
    });
});
