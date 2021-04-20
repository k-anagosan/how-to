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
    likes_count: 10,
    liked_by_me: false,
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
    it.each([
        ["author", "Icon", "icon-stub", "icon"],
        ["liked_by_me", "LikeButton", "likebutton-stub", "isLiked"],
    ])("article.%sを%sに渡せる", (data, _, stub, props) => {
        expect(wrapper.find(stub).props()[props]).toEqual(article[data]);
    });

    it.each([
        ["タイトル", ".article-title", "title"],
        ["いいね数", ".likes-count", "likes_count"],
    ])("%sが正しく表示される", (_, className, data) => {
        expect(wrapper.find(className).text()).toBe(String(article[data]));
    });
    it("タグが正しく表示される", () => {
        const tags = wrapper.findAll(".article-tag");
        expect(tags.length).toBe(article.tags.length);
        article.tags.forEach((tag, index) => {
            expect(tags.at(index).text()).toBe(tag.name);
        });
    });
});

describe("いいね処理関連", () => {
    let post = null;
    const spyOnChangeLike = jest.spyOn(Card.methods, "onChangeLike");
    beforeEach(() => {
        post = {
            namespaced: true,
            actions: {
                putLike: jest.fn().mockImplementation((context, data) => data),
                deleteLike: jest.fn().mockImplementation((context, data) => data),
            },
        };
        Test.setSpys({ spyOnChangeLike, putLike: post.actions.putLike, deleteLike: post.actions.deleteLike });
        Test.setVuex({ post });
        wrapper = Test.shallowWrapperFactory();
    });

    afterEach(() => {
        Test.clearSpysCalledTimes();
    });

    it("likeイベントが発火されたらonChangeLike()が実行される", () => {
        expect(spyOnChangeLike).not.toHaveBeenCalled();
        wrapper.find("likebutton-stub").vm.$emit("like", { isLiked: true });
        expect(spyOnChangeLike).toHaveBeenCalled();
    });

    describe.each([
        [{ isLiked: true }, true, "putLike"],
        [{ isLiked: false }, false, "deleteLike"],
    ])("onChangeLike()関連", (e, isLiked, action) => {
        it(`onChangeLike()がイベントオブジェクト{isLiked: ${isLiked}}で呼び出されたら${action}が実行される`, async () => {
            expect(post.actions.putLike).not.toHaveBeenCalled();
            expect(post.actions.deleteLike).not.toHaveBeenCalled();
            await wrapper.vm.onChangeLike(e);
            if (e.isLiked) {
                expect(post.actions.putLike).toHaveBeenCalled();
                expect(post.actions.deleteLike).not.toHaveBeenCalled();
            } else {
                expect(post.actions.putLike).not.toHaveBeenCalled();
                expect(post.actions.deleteLike).toHaveBeenCalled();
            }
        });
        it(`onChangeLike()がイベントオブジェクト{isLiked: ${isLiked}}で呼び出されたらchangeLikeイベントが発火される`, async () => {
            expect(post.actions.putLike).not.toHaveBeenCalled();
            expect(post.actions.deleteLike).not.toHaveBeenCalled();
            await wrapper.vm.onChangeLike(e);
            if (e.isLiked) {
                expect(wrapper.emitted().changeLike).toEqual([[{ id: article.id, isLiked: true }]]);
            } else {
                expect(wrapper.emitted().changeLike).toEqual([[{ id: article.id, isLiked: false }]]);
            }
        });
    });
});

describe("Vue Router 関連", () => {
    let spyPush = null;
    beforeEach(() => {
        spyPush = jest.spyOn(wrapper.vm.$router, "push");
        Test.setSpys({ spyPush });
        options.stubs = ["ion-icon"];
        Test.setMountOption(Card, options);
        wrapper = Test.wrapperFactory();
    });

    afterEach(() => {
        Test.clearSpysCalledTimes();
    });
    it("push()イベントハンドラにより記事詳細ページへ遷移する", async () => {
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.vm.push();
        expect(wrapper.vm.$route.path).toBe(`/article/${article.id}`);
    });

    it("カードをクリックしたらpush()が実行される", async done => {
        expect(spyPush).not.toHaveBeenCalled();
        await wrapper.find(".card").trigger("click");
        expect(spyPush).toHaveBeenCalled();
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

        await tags.wrappers.forEach(async tag => {
            spyPush.mock.calls = [];
            expect(spyPush).not.toHaveBeenCalled();
            await tag.find(".tag").trigger("click");
            expect(spyPush).toHaveBeenCalled();
        });
        done();
    });
});
