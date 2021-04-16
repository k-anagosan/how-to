import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";
import Card from "@/components/Card.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();

const article = {
    id: randomStr(20),
    title: randomStr(30),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: { name: randomStr(10) },
};

const options = {
    stubs: { RouterLink: RouterLinkStub },
    propsData: { article },
};

let wrapper = null;
beforeEach(() => {
    Test.setMountOption(Card, options);
    Test.setVueRouter();
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    wrapper.vm.$router.push("/").catch(() => {});
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    it("article.authorをIconに渡せる", () => {
        expect(wrapper.find("icon-stub").props().icon).toEqual(article.author);
    });
    it("タイトルが正しく表示される", () => {
        expect(wrapper.find(".article-title").text()).toBe(article.title);
    });
    it("タグが正しく表示される", () => {
        const tags = wrapper.findAll(".article-tag");
        expect(tags.length).toBe(article.tags.length);
        article.tags.forEach((tag, index) => {
            expect(tags.at(index).text()).toBe(tag.name);
        });
    });
});

describe("Vue Router 関連", () => {
    beforeEach(() => {
        options.stubs = {};
        Test.setMountOption(Card, options);
        wrapper = Test.wrapperFactory();
    });
    it("カードRouterLinkのtoに記事詳細ページへのurlが設定される", () => {
        expect(wrapper.find(".card").props().to).toBe(`/article/${article.id}`);
    });
    it("カードをクリックしたら記事詳細ページに飛ぶ", async done => {
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.find(".card").trigger("click");
        expect(wrapper.vm.$route.path).toBe(`/article/${article.id}`);
        done();
    });
    it("タグRouterLinkのtoにタグページ（未実装）へのurl（仮では'/'）が設定される", () => {
        const tags = wrapper.findAll(".tag");
        tags.wrappers.forEach(tag => {
            expect(tag.props().to).toBe("/");
        });
    });
    it("タグををクリックしたら指定したページ（仮では'/'）に飛ぶ", async done => {
        const tags = wrapper.findAll(".tag");
        const spyPush = jest.spyOn(wrapper.vm.$router, "push");

        await tags.wrappers.forEach(async tag => {
            spyPush.mock.calls = [];
            expect(spyPush).not.toHaveBeenCalled();
            await tag.find(".tag").trigger("click");
            expect(spyPush).toHaveBeenCalled();
        });
        done();
    });
});
