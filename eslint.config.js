// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import a11y from "eslint-plugin-jsx-a11y";

export default [
  js.configs.recommended,

  // React base
  { ...react.configs.recommended, settings: { react: { version: "detect" } } },

  // React Hooks rules (same as CRA)
  { rules: { ...reactHooks.configs.recommended.rules } },

  // Accessibility (JSX a11y)
  a11y.configs.recommended,

  // Project specifics
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // remove these if you now import them as modules:
        DOMPurify: "readonly",
        marked: "readonly",
        FullCalendar: "readonly"
      }
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.config.js"
    ]
  }
];

