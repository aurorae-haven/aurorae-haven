// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import a11y from "eslint-plugin-jsx-a11y";

export default [
  // Global ignores (must be first)
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "public/service-worker.js",
      "scripts/**",
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/*.test.js",
      "**/*.test.jsx"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "jsx-a11y": a11y
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Blob: "readonly",
        URL: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        FileReader: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        MutationObserver: "readonly",
        process: "readonly",
        // remove these if you now import them as modules:
        DOMPurify: "readonly",
        marked: "readonly",
        FullCalendar: "readonly"
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-console": "off",
      "react/react-in-jsx-scope": "off" // Not needed in React 17+
    }
  }
];

