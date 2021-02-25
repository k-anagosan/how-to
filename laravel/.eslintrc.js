module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:all",
        "plugin:vue/recommended",
        "prettier",
        "prettier/vue",
    ],
    globals: {
        document: true,
        window: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        mount: true,
    },
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: false,
        },
        ecmaVersion: 2018,
        parser: "babel-eslint",
        sourceType: "module",
    },
    plugins: ["vue"],
    rules: {
        "no-console": "off",
        "no-new": "off",
        "one-var": "off",
        "sort-imports": "off",
        "sort-keys": "off",
        "capitalized-comments": "off",
        "no-magic-numbers": "off",
    },
};
