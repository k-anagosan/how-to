import TestUtils from "@/testutils";
import ArchiveButton from "@/components/ArchiveButton.vue";
import { randomStr } from "@/utils";

const Test = new TestUtils();

Test.setMountOption(ArchiveButton, { stubs: ["ion-icon"] });

const username = randomStr();
let wrapper = null;
let auth = null;
let propsData = {};
beforeEach(() => {
    Test.setMountOption(ArchiveButton, { propsData });
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
            [true, "ion-icon[name='bookmark']", "ion-icon-stub[name='bookmark']"],
            [false, "icon-icon[name='bookmark-outline']", "ion-icon-stub[name='bookmark-outline']"],
        ])(
            `isArchived=%sの時、propsのsizeが${size}であるなら%sに.text-xlが${isAdded}`,
            async (isArchived, _, stubs) => {
                await wrapper.setProps({ size, isArchived });
                if (size === "lg") {
                    expect(wrapper.find(stubs).classes()).toContain("text-xl");
                } else {
                    expect(wrapper.find(stubs).classes()).not.toContain("text-xl");
                }
            }
        );
    });

    it("propsのsizeが無ければ.icon-size-mdクラスが付加される", () => {
        expect(wrapper.props().size).toBe("md");
        expect(wrapper.classes()).toContain("icon-size-md");
    });

    it.each([
        [true, "bookmark"],
        [false, "bookmark-outline"],
    ])("propsのisArchivedが%sならion-iconの%sが表示される", async isArchived => {
        await wrapper.setProps({ isArchived });
        expect(wrapper.props().isArchived).toBe(isArchived);
        expect(wrapper.find("ion-icon-stub[name='bookmark-outline']").exists()).toBe(!isArchived);
        expect(wrapper.find("ion-icon-stub[name='bookmark']").exists()).toBe(isArchived);
    });

    it("propsのisArchivedが無ければfalseが設定される", () => {
        expect(wrapper.props().isArchived).toBe(false);
    });
});

describe("メソッド、イベント関連", () => {
    const spyOnClick = jest.spyOn(ArchiveButton.methods, "onClick");
    const spyEnable = jest.spyOn(ArchiveButton.methods, "enable");
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
    ])("%s, onClick()実行によりarchiveイベントが{isArchived: %s}を伴って発火される", async (_, isArchived) => {
        if (!isArchived) {
            await wrapper.setProps({ isArchived: !isArchived });
        }
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isArchived).toBe(!isArchived);
        expect(wrapper.vm.$data.disabled).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        expect(wrapper.emitted().archive).toEqual([[{ isArchived }]]);
        expect(wrapper.vm.$data.disabled).toBe(true);
    });

    it.each([
        [false, "できる"],
        [true, "できない"],
    ])("dataのdisabledが%sなら、onClick()を実行%s", async disabled => {
        await wrapper.setData({ disabled });
        expect(spyOnClick).not.toHaveBeenCalled();
        expect(wrapper.props().isArchived).toBe(false);
        wrapper.vm.onClick();
        expect(spyOnClick).toHaveBeenCalled();
        if (disabled) {
            expect(wrapper.emitted().archive).toBeUndefined();
        } else {
            expect(wrapper.emitted().archive).toEqual([[{ isArchived: true }]]);
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
