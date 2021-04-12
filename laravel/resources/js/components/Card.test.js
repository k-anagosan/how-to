import {
    mount,
    shallowMount,
    createLocalVue,
    RouterLinkStub,
} from "@vue/test-utils";
import Card from "@/components/Card.vue";
import VueRouter from "vue-router";
import { randomStr } from "@/utils";

const localVue = createLocalVue();
localVue.use(VueRouter);

const article = {
    id: randomStr(20),
    title: randomStr(30),
    tags: [
        { name: randomStr(10) },
        { name: randomStr(10) },
        { name: randomStr(10) },
    ],
    author: {
        name: randomStr(10),
    },
};

const router = new VueRouter({ mode: "history" });

const options = {
    router,
    localVue,
    stubs: {
        RouterLink: RouterLinkStub,
    },
    propsData: {
        article,
    },
};

const factory = options => shallowMount(Card, options);

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
    it("投稿者が正しく表示される", () => {
        expect(wrapper.find(".article-author").text()).toBe(
            article.author.name
        );
    });
    it("タイトルが正しく表示される", () => {
        expect(wrapper.find(".article-title").text()).toBe(article.title);
    });
    it("タグが正しく表示される", () => {
        const tags = wrapper.findAll(".article-tag");
        expect(tags.length).toBe(article.tags.length);
        article.tags.forEach((tag, i) => {
            expect(tags.at(i).text()).toBe(tag.name);
        });
    });
});

describe("Vue Router 関連", () => {
    beforeEach(() => {
        const noneStubOption = { ...options };
        delete noneStubOption.stubs;
        wrapper = mount(Card, noneStubOption);
    });
    it("カードRouterViewのtoに記事詳細ページへのurlが設定される", () => {
        expect(wrapper.find(".card").props().to).toBe(`/article/${article.id}`);
    });
    it("カードをクリックしたら記事詳細ページに飛ぶ", async done => {
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.find(".card").trigger("click");
        expect(wrapper.vm.$route.path).toBe(`/article/${article.id}`);
        done();
    });
    it("タグRouterViewのtoにタグページ（未実装）へのurl（仮では'/'）が設定される", () => {
        const tags = wrapper.findAll(".tag");

        tags.wrappers.forEach(tag => {
            expect(tag.props().to).toBe("/");
        });
    });
    it("タグををクリックしたら指定したページ（仮では'/'）に飛ぶ", () => {
        const tags = wrapper.findAll(".tag");
        const spyPush = jest.spyOn(router, "push");

        tags.wrappers.forEach(async tag => {
            spyPush.mock.calls = [];
            expect(spyPush).not.toHaveBeenCalled();
            await tag.find(".tag").trigger("click");
            expect(spyPush).toHaveBeenCalled();
        });
    });
});
