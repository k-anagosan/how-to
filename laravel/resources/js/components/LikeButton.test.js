import TestUtils from "@/testutils";
import LikeButton from "@/components/LikeButton.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();

Test.setMountOption(LikeButton, { stubs: ["ion-icon"] });

const username = randomStr();
let wrapper = null;
let auth = null;
let propsData = {};
beforeEach(() => {
    Test.setMountOption(LikeButton, { propsData });
    auth = {
        namespaced: true,
        state: { user: { name: username } },
        mutations: {
            setUser(state, user) {
                state.user = user;
            },
        },
        getters: {
            username: state => (state.user ? state.user.name : ""),
        },
    };
    Test.setVuex({ auth });
    Test.setVueRouter();
    wrapper = Test.shallowWrapperFactory();
});

afterEach(() => {
    propsData = {};
    wrapper.destroy();
    wrapper = null;
});

describe("表示関連", () => {
    describe.each([
        ["sm", "付加されない"],
        ["md", "付加されない"],
        ["lg", "付加される"],
    ])("ion-icon関連", (size, isAdded) => {
        it(`propsのsize=${size}により.icon-size-${size}が付加される`, async () => {
            await wrapper.setProps({ size });
            expect(wrapper.props().size).toBe(size);
            expect(wrapper.classes()).toContain(`icon-size-${size}`);
        });

        it.each([
            [true, "ion-icon[name='heaert']", "ion-icon-stub[name='heart']"],
            [false, "icon-icon[name='heart-outline']", "ion-icon-stub[name='heart-outline']"],
        ])(`isLiked=%sの時、propsのsizeが${size}であるなら%sに.text-xlが${isAdded}`, async (isLiked, _, stubs) => {
            await wrapper.setProps({ size, isLiked });
            if (size === "lg") {
                expect(wrapper.find(stubs).classes()).toContain("text-xl");
            } else {
                expect(wrapper.find(stubs).classes()).not.toContain("text-xl");
            }
        });
    });

    it("propsのsizeが無ければ.icon-size-mdクラスが付加される", () => {
        expect(wrapper.props().size).toBe("md");
        expect(wrapper.classes()).toContain("icon-size-md");
    });

    it.each([
        [true, "heart"],
        [false, "heart-outline"],
    ])("propsのisLikedが%sならion-iconの%sが表示される", async isLiked => {
        await wrapper.setProps({ isLiked });
        expect(wrapper.props().isLiked).toBe(isLiked);
        expect(wrapper.find("ion-icon-stub[name='heart-outline']").exists()).toBe(!isLiked);
        expect(wrapper.find("ion-icon-stub[name='heart']").exists()).toBe(isLiked);
    });

    it("propsのisLikedが無ければfalseが設定される", () => {
        expect(wrapper.props().isLiked).toBe(false);
    });
});

describe("メソッド、イベント関連", () => {
    const spyOnClick = jest.spyOn(LikeButton.methods, "onClick");
    const spyEnable = jest.spyOn(LikeButton.methods, "enable");
    beforeEach(() => {
        Test.setSpys({ spyOnClick, spyEnable });
    });

    afterEach(() => {
        Test.clearSpysCalledTimes();
    });

    it("buttonクリックによりonClick()ハンドラが実行される", async () => {
        expect(spyOnClick).not.toHaveBeenCalled();
        await wrapper.find("button").trigger("click");
        expect(spyOnClick).toHaveBeenCalled();
    });

    it.each([
        ["いいね未付与時、", true],
        ["いいね付与済み時", false],
    ])("%s, onClick()実行によりlikeイベントが{isLiked: %s}を伴って発火される", async (_, isLiked) => {
        if (!isLiked) {
            await wrapper.setProps({ isLiked: !isLiked });
        }
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isLiked).toBe(!isLiked);
        expect(wrapper.vm.$data.disabled).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        expect(wrapper.emitted().like).toEqual([[{ isLiked }]]);
        expect(wrapper.vm.$data.disabled).toBe(true);
    });

    it.each([
        [false, "できる"],
        [true, "できない"],
    ])("dataのdisabledが%sなら、onClick()を実行%s", async disabled => {
        await wrapper.setData({ disabled });
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isLiked).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        if (disabled) {
            expect(wrapper.emitted().like).toBeUndefined();
        } else {
            expect(wrapper.emitted().like).toEqual([[{ isLiked: true }]]);
        }
    });

    it("onClick()実行時、setTimeout()により指定時間後にenable()が実行される", async done => {
        await wrapper.setData({ disabled: false });
        expect(spyEnable).not.toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(false);
        await wrapper.vm.onClick();
        setTimeout(() => {
            expect(spyEnable).toHaveBeenCalled();
            expect(wrapper.vm.$data.disabled).toBe(false);
            done();
        }, 1000);
    });

    it("enable()が実行されればdisabledにfalseが代入される", async done => {
        await wrapper.setData({ disabled: true });
        expect(spyEnable).not.toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(true);
        wrapper.vm.enable();
        expect(spyEnable).toHaveBeenCalled();
        expect(wrapper.vm.$data.disabled).toBe(false);
        done();
    });

    it("onClick()実行時に未ログイン状態であれば'/loing'に遷移する", async () => {
        wrapper.vm.$store.commit("auth/setUser", null, { root: true });
        await wrapper.vm.onClick();
        expect(wrapper.vm.$route.path).toBe("/login");
    });
});

describe("vuex関連", () => {
    it("usernameを算出できる", () => {
        expect(Test.computedValue("username", { $store: wrapper.vm.$store })).toBe(username);
    });
});
