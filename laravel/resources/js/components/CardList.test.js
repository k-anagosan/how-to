import TestUtils from "@/testutils";
import CardList from "@/components/CardList.vue";
import { randomStr } from "../utils";

const Test = new TestUtils();
const spyOnChangeLike = jest.spyOn(CardList.methods, "onChangeLike");
const spyOnChangeArchive = jest.spyOn(CardList.methods, "onChangeArchive");
Test.setSpys({ spyOnChangeLike, spyOnChangeArchive });

const article = () => ({
    id: randomStr(20),
    title: randomStr(30),
    content: randomStr(100),
    tags: [{ name: randomStr(10) }, { name: randomStr(10) }, { name: randomStr(10) }],
    author: {
        name: randomStr(10),
    },
    liked_by_me: false,
    likes_count: 10,
    archived_by_me: false,
});
const articleList = [...Array(18)].map(article);

let [wrapper, options] = [null, null];
beforeEach(() => {
    options = {
        propsData: { list: articleList },
    };
    Test.setMountOption(CardList, options);
    wrapper = Test.shallowWrapperFactory();
});
afterEach(() => {
    Test.clearSpysCalledTimes();
    wrapper = null;
});

describe("表示関連", () => {
    it("各Cardにlistの各要素を渡せる", () => {
        wrapper.findAll("card-stub").wrappers.forEach((wrapper, index) => {
            expect(wrapper.props().article).toEqual(articleList[index]);
        });
    });

    it("slotがあれば表示される", () => {
        const template = `<h1>${randomStr(10)}</h1>`;
        options.slots = { default: template };
        Test.setMountOption(CardList, options);
        wrapper = Test.shallowWrapperFactory();

        expect(wrapper.find("h1").exists()).toBe(true);
    });
});

describe("いいね関連", () => {
    it("changeLikeイベントが発火されたらonChangeLike()が実行される", () => {
        expect(spyOnChangeLike).not.toHaveBeenCalled();
        wrapper.find("card-stub").vm.$emit("changeLike", { id: randomStr(20), isLiked: true });
        expect(spyOnChangeLike).toHaveBeenCalled();
    });

    it("onChangeLike()によりchangeLikeイベントがで発火される", async () => {
        const event = { id: randomStr(20), isLiked: true };
        expect(wrapper.emitted()).toEqual({});
        await wrapper.vm.onChangeLike(event);
        expect(wrapper.emitted().changeLike).toEqual([[event]]);
    });
});

describe("アーカイブ関連", () => {
    it("changeArchiveイベントが発火されたらonChangeArchive()が実行される", () => {
        expect(spyOnChangeArchive).not.toHaveBeenCalled();
        wrapper.find("card-stub").vm.$emit("changeArchive", { id: randomStr(20), isArchived: true });
        expect(spyOnChangeArchive).toHaveBeenCalled();
    });

    it("onChangeArchive()によりchangeArchiveイベントがで発火される", async () => {
        const event = { id: randomStr(20), isArchived: true };
        expect(wrapper.emitted()).toEqual({});
        await wrapper.vm.onChangeArchive(event);
        expect(wrapper.emitted().changeArchive).toEqual([[event]]);
    });
});
