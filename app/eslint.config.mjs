import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict",
    "plugin:prettier/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslintEslintPlugin,
        import: fixupPluginRules(_import),
    },

    rules: {
        "arrow-body-style": ["error", "as-needed"],
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/order": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
            maxEOF: 1,
        }],

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: ["block-like", "class", "function"],
            next: "*",
        }],

        "prettier/prettier": ["error", {
            singleQuote: true,
            trailingComma: "all",
            tabWidth: 2,
            semi: false,
        }],

        "react/jsx-curly-brace-presence": ["error", {
            props: "never",
            children: "ignore",
        }],

        "@typescript-eslint/no-unused-expressions": ["error", {
            allowShortCircuit: true,
            allowTernary: true,
        }],
    },
}];