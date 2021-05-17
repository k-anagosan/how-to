import TestUtils from "@/testutils";
import { RouterLinkStub } from "@vue/test-utils";
import Card from "@/components/Card.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyOnChangeLike = jest.spyOn(Card.methods, "onChangeLike");
const spyPush = jest.spyOn(Card.methods, "push");
const spyDeleteCard = jest.spyOn(Card.methods, "deleteCard");
Test.setSpys({ spyOnChangeLike, spyPush, spyDeleteCard });

const username = randomStr();
const article = {
    id: randomStr(20),
    title: randomStr(30),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: { name: randomStr(10) },
    likes_count: 10,
    liked_by_me: false,
};

let options = null;
let wrapper = null;
let router = null;
let [post, userpage, auth] = [null, null, null];
beforeEach(() => {
    options = {
        stubs: { RouterLink: RouterLinkStub, "ion-icon": true },
        propsData: { article, ownedByMe: true },
    };
    Test.setMountOption(Card, options);
    router = Test.setVueRouter();
    auth = {
        namespaced: true,
        state: { user: { name: username } },
        mutations: {
            setUser(state, user) {
                state.user = user;
            },
        },
        getters: { username: jest.fn().mockImplementation(state => (state.user ? state.user.name : "")) },
    };
    post = {
        namespaced: true,
        actions: {
            putLike: jest.fn().mockImplementation((context, data) => data),
            deleteLike: jest.fn().mockImplementation((context, data) => data),
        },
    };
    userpage = {
        namespaced: true,
        mutations: {
            setArticles: jest.fn().mockImplementation((state, data) => data),
        },
    };
    Test.setSpys({
        spyOnChangeLike,
        username: auth.getters.username,
        putLike: post.actions.putLike,
        deleteLike: post.actions.deleteLike,
    });
    Test.setVuex({ post, userpage, auth });

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
        if (stub === "icon-stub") {
            wrapper.findAll(stub).wrappers.forEach(wrapper => {
                expect(wrapper.props()[props]).toEqual(article[data]);
            });
        }
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

    it.each([
        [true, "表示される"],
        [false, "表示されない"],
    ])("onwedByMeが%sの時EditMenuが%s", ownedByMe => {
        options.propsData.ownedByMe = ownedByMe;
        Test.setMountOption(Card, options);
        wrapper = Test.shallowWrapperFactory();

        expect(wrapper.find("editmenu-stub").exists()).toBe(ownedByMe);
    });

    it("EditMenuのarticle-idに値を正しく渡せている", () => {
        expect(wrapper.find("editmenu-stub").props().articleId).toBe(wrapper.vm.article.id);
    });
});

describe("メソッド関連", () => {
    it("EditMenuからdeleteイベントが発火されたらdeleteCard()が実行される", () => {
        expect(spyDeleteCard).not.toHaveBeenCalled();
        wrapper.find("editmenu-stub").vm.$emit("delete");
        expect(spyDeleteCard).toHaveBeenCalled();
    });

    it("deleteCard()が実行されたらsetArticlesミューテーションが実行される", () => {
        expect(userpage.mutations.setArticles).not.toHaveBeenCalled();
        wrapper.vm.deleteCard();
        expect(userpage.mutations.setArticles.mock.calls[0][1]).toBeNull();
    });
});

describe("いいね処理関連", () => {
    beforeEach(() => {
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
            expect(wrapper.emitted().changeLike).toEqual([[{ id: article.id, isLiked }]]);
        });

        it("未ログイン状態ならイベントが発火されず$router.push()が実行される", async () => {
            const spyRouterPush = jest.spyOn(router, "push").mockImplementation(() => {});
            wrapper.vm.$store.commit("auth/setUser", null, { root: true });

            expect(spyRouterPush).not.toHaveBeenCalled();
            await wrapper.vm.onChangeLike(e);
            expect(spyRouterPush.mock.calls[0][0]).toBe("/login");
            expect(wrapper.emitted().changeLike).toBeUndefined();
            spyRouterPush.mockRestore();
        });
    });

    describe("いいね処理失敗時", () => {
        beforeEach(() => {
            post = {
                namespaced: true,
                actions: {
                    putLike: jest.fn().mockImplementation(() => null),
                    deleteLike: jest.fn().mockImplementation(() => null),
                },
            };
            Test.setSpys({ spyOnChangeLike, putLike: post.actions.putLike, deleteLike: post.actions.deleteLike });
            Test.setVuex({ post, userpage, auth });
            wrapper = Test.shallowWrapperFactory();
        });

        it.each([
            ["putLike", false, { isLiked: true }],
            ["deleteLike", true, { isLiked: false }],
        ])("%sアクションの結果がnullなら{isLiked: %s}で再度changeLikeイベントを発火する", async (_, isLiked, e) => {
            expect(post.actions.putLike).not.toHaveBeenCalled();
            expect(post.actions.deleteLike).not.toHaveBeenCalled();
            await wrapper.vm.onChangeLike(e);
            expect(wrapper.emitted().changeLike).toEqual([
                [{ id: article.id, isLiked: !isLiked }],
                [{ id: article.id, isLiked }],
            ]);
        });
    });
});

describe("Vue Router 関連", () => {
    let spyRouterPush = null;
    beforeEach(() => {
        spyRouterPush = jest.spyOn(wrapper.vm.$router, "push");
        Test.setSpys({ spyRouterPush });
        options.stubs = ["ion-icon"];
        Test.setMountOption(Card, options);
        wrapper = Test.wrapperFactory();
    });

    afterEach(() => {
        if (wrapper.vm.$route.path !== "/") wrapper.vm.$router.push("/");
        Test.clearSpysCalledTimes();
    });
    it("push()イベントハンドラにより記事詳細ページへ遷移する", async done => {
        expect(wrapper.vm.$route.path).toBe(`/`);
        await wrapper.vm.push(wrapper.vm.$el.querySelector(".card"));
        expect(wrapper.vm.$route.path).toBe(`/article/${article.id}`);
        done();
    });

    it("カードをクリックしたらpush()が実行される", async done => {
        expect(spyPush).not.toHaveBeenCalled();
        await wrapper.find(".card").trigger("click");
        expect(spyPush).toHaveBeenCalled();
        expect(spyRouterPush).toHaveBeenCalled();
        done();
    });

    it("メニュー開閉ボタンをクリックしたら$router.push()は実行されない", async done => {
        expect(spyPush).not.toHaveBeenCalled();
        await wrapper.find(`#open-button-${wrapper.vm.article.id}`).trigger("click");
        expect(spyPush).toHaveBeenCalled();
        expect(spyRouterPush).not.toHaveBeenCalled();
        done();
    });

    it("タグを表すRouterLinkのtoにタグページへのurlが設定される", () => {
        const tags = wrapper.findAll(".tag");
        tags.wrappers.forEach((tag, index) => {
            expect(tag.props().to).toBe(`/tag/${article.tags[index].name}`);
        });
    });
    it("タグををクリックしたら指定したページに飛ぶ", () => {
        const tags = wrapper.findAll(".tag");

        tags.wrappers.forEach((tag, index) => {
            expect(spyRouterPush).not.toHaveBeenCalled();
            expect(wrapper.vm.$route.path).toBe("/");
            tag.trigger("click");
            expect(spyRouterPush).toHaveBeenCalled();
            expect(wrapper.vm.$route.path).toBe(`/tag/${article.tags[index].name}`);
            wrapper.vm.$router.push("/");
            spyRouterPush.mock.calls = [];
        });
    });
});

describe("vuex 関連", () => {
    it("usernameを正しく算出できる", () => {
        expect(Test.computedValue("username", { $store: wrapper.vm.$store })).toBe(username);
    });
});
