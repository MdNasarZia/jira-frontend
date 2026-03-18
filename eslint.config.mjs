import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

// eslint-config-next v16 exports a flat config array natively.
// prettier must be last to disable any formatting rules that conflict.
const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      "no-console": "warn",

      // Downgraded to warn for existing codebase — these should be fixed over time:
      // Apostrophes in JSX must be escaped (e.g., use &apos; or wrap in a string)
      "react/no-unescaped-entities": "warn",
      // Math.random() inside useMemo is impure — acceptable for skeleton UI widths
      "react-hooks/purity": "warn",
      // Prefer Next.js <Image> component over <img> for performance
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
