import TestUtils from "@/testutils";
import ArticleDetail from "@/pages/ArticleDetail.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");
const spyOnChangeLike = jest.spyOn(ArticleDetail.methods, "onChangeLike");
const spyDeleteArticle = jest.spyOn(ArticleDetail.methods, "deleteArticle");
Test.setSpys({ spyFetchArticle, spyOnChangeLike, spyDeleteArticle });

let wrapper = null;
let response = null;
let [post, auth] = [null, null];
const authorName = randomStr(10);
beforeEach(() => {
    response = {
        id: randomStr(20),
        title: randomStr(30),
        content: randomStr(100),
        tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
        author: { name: authorName },
        likes_count: 10,
        liked_by_me: false,
    };
    post = {
        namespaced: true,
        actions: {
            getArticle: jest.fn().mockImplementation(() => ({ ...response })),
            putLike: jest.fn().mockImplementation(() => randomStr()),
            deleteLike: jest.fn().mockImplementation(() => randomStr()),
        },
    };
    auth = {
        namespaced: true,
        getters: {
            username: jest.fn().mockImplementation(() => authorName),
        },
    };

    Test.setSpys({
        getArticle: post.actions.getArticle,
        putLike: post.actions.putLike,
        deleteLike: post.actions.deleteLike,
        username: auth.getters.username,
    });
    Test.setVueRouter();
    Test.setVuex({ post, auth });

    const options = { propsData: { id: randomStr(20) }, stubs: { "ion-icon": true } };
    Test.setMountOption(ArticleDetail, options);
    wrapper = Test.shallowWrapperFactory();
    Test.clearSpysCalledTimes();
});

afterEach(() => {
    wrapper.destroy();
    wrapper = null;
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

    it.each([
        ["MarkdownPreview", "content", "text", "markdownpreview-stub"],
        ["Icon", "author", "icon", "icon-stub"],
        ["IconList", "tags", "icons", "iconlist-stub"],
        ["LikeButton", "liked_by_me", "isLiked", "likebutton-stub"],
    ])("記事データを取得したら%sへarticle.%sを渡せる", (_, data, props, stubs) => {
        expect(wrapper.find(stubs).props()[props]).toEqual(response[data]);
    });

    it("いいね数が表示される", () => {
        wrapper.findAll(".likes-count").wrappers.forEach(wrapper => {
            expect(wrapper.text()).toBe(String(response.likes_count));
        });
    });

    it.each([
        ["Icon", "/user/{author.name}", "icon-stub"],
        ["IconList", "/tag", "iconlist-stub"],
    ])("%sのtoに%sを渡せる", (_, url, stub) => {
        if (stub === "iconlist-stub") {
            expect(wrapper.find(stub).props().to).toBe(url);
        } else {
            const url = `/user/${response.author.name}`;
            wrapper.findAll(stub).wrappers.forEach(wrapper => {
                expect(wrapper.props().to).toBe(url);
            });
        }
    });

    it.each([
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#article-detail").exists()).toBe(!isShown);
    });

    it.each([
        ["自身の記事の場合", "表示される", true],
        ["自身のものでない記事の場合", "表示されない", false],
    ])("%sにEditMenuが%s", async (_, __, isOwned) => {
        if (!isOwned) {
            auth.getters.username = jest.fn().mockImplementation(() => "");
            Test.setVuex({ post, auth });
            wrapper = Test.shallowWrapperFactory();
            await wrapper.vm.fetchArticle();
        }
        expect(wrapper.find("editmenu-stub").exists()).toBe(isOwned);
    });
});

describe("メソッド関連", () => {
    it.each([
        ["自身の記事の場合", true],
        ["自身のものでない記事の場合", false],
    ])("%sにisOwned()が期待した値を返す", async (_, isOwned) => {
        if (!isOwned) {
            auth.getters.username = jest.fn().mockImplementation(() => "");
            Test.setVuex({ post, auth });
            wrapper = Test.shallowWrapperFactory();
            await wrapper.vm.fetchArticle();
        }
        expect(wrapper.vm.isOwned()).toBe(isOwned);
    });

    it("EditMenuからdeleteイベントが発火されたらdeleteArticle()が実行される", () => {
        const spyDeleteArticle = jest.spyOn(ArticleDetail.methods, "deleteArticle").mockImplementation(() => {});
        wrapper.findAll("editmenu-stub").wrappers.forEach(wrapper => {
            expect(spyDeleteArticle).not.toHaveBeenCalled();
            wrapper.vm.$emit("delete");
            expect(spyDeleteArticle).toHaveBeenCalled();
            spyDeleteArticle.mock.calls = [];
        });
        spyDeleteArticle.mockRestore();
    });

    it("deleteArticle()が実行されたら'/'に移動する", async () => {
        wrapper.vm.$router.push("/article/xxx");
        await wrapper.vm.deleteArticle();
        expect(wrapper.vm.$route.path).toBe("/");
    });
});

describe("いいね関連", () => {
    it("likeイベントが発火されたらonChangeLike()が実行される", async () => {
        await wrapper.findAll("likebutton-stub").wrappers.forEach(wrapper => {
            expect(spyOnChangeLike).not.toHaveBeenCalled();
            wrapper.vm.$emit("like", { isLiked: true });
            expect(spyOnChangeLike).toHaveBeenCalled();
            Test.clearSpysCalledTimes();
        });
    });

    describe.each([[true], [false]])("isLikedが%sの時のonChangeLike()関連", isLiked => {
        it(`isLikedが${isLiked}ならいいね数が1つ${
            isLiked ? "増え" : "減り"
        }、liked_by_meが${isLiked}になる`, async () => {
            wrapper.vm.$data.article.liked_by_me = !isLiked;

            await wrapper.vm.onChangeLike({ isLiked });
            let [likedByMe, likesCount] = [null, response.likes_count];

            if (isLiked) {
                likedByMe = true;
                likesCount += 1;
            } else {
                likedByMe = false;
                likesCount -= 1;
            }

            expect(wrapper.vm.$data.article.liked_by_me).toBe(likedByMe);
            expect(wrapper.vm.$data.article.likes_count).toBe(likesCount);
        });

        it("APIに失敗したら、いいね数とliked_by_meが元に戻る", async () => {
            if (isLiked) {
                post.actions.putLike = jest.fn().mockImplementation(() => null);
                expect(post.actions.putLike).not.toHaveBeenCalled();
            } else {
                post.actions.deleteLike = jest.fn().mockImplementation(() => null);
                expect(post.actions.deleteLike).not.toHaveBeenCalled();
            }

            Test.setVuex({ post, auth });
            wrapper = Test.shallowWrapperFactory();
            await wrapper.vm.fetchArticle().then(() => {
                wrapper.vm.$data.article.liked_by_me = !isLiked;
            });
            await wrapper.vm.onChangeLike({ isLiked });
            const likesCount = response.likes_count;

            if (isLiked) {
                expect(post.actions.putLike).toHaveBeenCalled();
            } else {
                expect(post.actions.deleteLike).toHaveBeenCalled();
            }
            expect(wrapper.vm.$data.article.liked_by_me).toBe(!isLiked);
            expect(wrapper.vm.$data.article.likes_count).toBe(likesCount);
        });
    });

    it("like()メソッドが正しく機能する", () => {
        expect(wrapper.vm.$data.article.likes_count).toBe(10);
        expect(wrapper.vm.$data.article.liked_by_me).toBe(false);
        wrapper.vm.like();
        expect(wrapper.vm.$data.article.likes_count).toBe(11);
        expect(wrapper.vm.$data.article.liked_by_me).toBe(true);
    });

    it("unlike()メソッドが正しく機能する", () => {
        wrapper.vm.$data.article.liked_by_me = true;
        expect(wrapper.vm.$data.article.likes_count).toBe(10);
        expect(wrapper.vm.$data.article.liked_by_me).toBe(true);
        wrapper.vm.unlike();
        expect(wrapper.vm.$data.article.likes_count).toBe(9);
        expect(wrapper.vm.$data.article.liked_by_me).toBe(false);
    });
});

describe("Vuex 関連", () => {
    it("ページアクセスしたらgetArticleアクションが実行される", async done => {
        expect(spyFetchArticle).not.toHaveBeenCalled();
        await wrapper.vm.$router.push(`/article/${randomStr(20)}`);
        expect(spyFetchArticle).toHaveBeenCalled();
        done();
    });

    it("loginUsernameを正しく算出している", () => {
        expect(Test.computedValue("loginUsername", { $store: wrapper.vm.$store }));
    });
});
