// eslint.config.js
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";

/**
 * Equivalent to your former .eslintrc.json
 * - uses the react-app style base
 * - preserves env, globals, rules, and ignores
 */

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // React plugin (approx. "react-app" preset)
  {
    ...reactPlugin.configs.recommended,
    settings: {
      react: { version: "detect" }
    }
  },

  // Project-specific options
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        DOMPurify: "readonly",
        marked: "readonly",
        FullCalendar: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js"
    ]
  }
];
