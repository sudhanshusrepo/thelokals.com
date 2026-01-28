const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const globals = require("globals");

module.exports = [
    {
        ignores: ["dist/**", "node_modules/**", "public/**", "**/*.d.ts", ".next/**"]
    },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: "latest",
                sourceType: "module"
            },
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            // TypeScript Rules
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],

            // React Rules
            ...reactPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/no-unknown-property": "off",

            // Hooks Rules
            ...reactHooksPlugin.configs.recommended.rules
        }
    }
];
