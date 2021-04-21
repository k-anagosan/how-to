import TestUtils from "@/testutils";
import ArticleDetail from "@/pages/ArticleDetail.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();
const spyFetchArticle = jest.spyOn(ArticleDetail.methods, "fetchArticle");
Test.setSpys({ spyFetchArticle });

let wrapper = null;
let response = null;
beforeEach(() => {
    response = {
        id: randomStr(20),
        title: randomStr(30),
        content: randomStr(100),
        tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
        author: { name: randomStr(10) },
        likes_count: 10,
        liked_by_me: false,
    };
    const post = {
        namespaced: true,
        actions: {
            getArticle: jest.fn().mockImplementation(() => ({ ...response })),
            putLike: jest.fn(),
            deleteLike: jest.fn(),
        },
    };

    Test.setSpys({ getArticle: post.actions.getArticle });
    Test.setVueRouter();
    Test.setVuex({ post });

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
        [true, "される"],
        [false, "されない"],
    ])("loadingが%sのときはSpinnerが表示%s", async isShown => {
        await wrapper.setData({ loading: isShown });
        expect(wrapper.find("spinner-stub").exists()).toBe(isShown);
        expect(wrapper.find("#article-detail").exists()).toBe(!isShown);
    });
});

describe("いいね関連", () => {
    const spyOnChangeLike = jest.spyOn(ArticleDetail.methods, "onChangeLike");
    beforeEach(() => {
        Test.setSpys({ spyOnChangeLike });
    });

    it("likeイベントが発火されたらonChangeLike()が実行される", async () => {
        await wrapper.findAll("likebutton-stub").wrappers.forEach(wrapper => {
            expect(spyOnChangeLike).not.toHaveBeenCalled();
            wrapper.vm.$emit("like", { isLiked: true });
            expect(spyOnChangeLike).toHaveBeenCalled();
            Test.clearSpysCalledTimes();
        });
    });

    it.each([
        [true, "増え", true],
        [false, "減り", false],
    ])("isLikedが%sならいいね数が1つ%s、liked_by_meが%sになる", async isLiked => {
        if (!isLiked) wrapper.vm.$data.article.liked_by_me = true;

        await wrapper.vm.onChangeLike({ isLiked });
        let likedByMe = response.liked_by_me;
        let likesCount = response.likes_count;

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
});

describe("Vuex", () => {
    it("ページアクセスしたらgetArticleアクションが実行される", async done => {
        expect(spyFetchArticle).not.toHaveBeenCalled();
        await wrapper.vm.$router.push(`/article/${randomStr(20)}`);
        expect(spyFetchArticle).toHaveBeenCalled();
        done();
    });
});
