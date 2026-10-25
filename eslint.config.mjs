import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "data/**",
      "tools/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // 项目处于交付收敛阶段：未使用变量视为错误，避免死代码持续堆积。
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // 页面在挂载时拉取运行时数据是刻意的同步点，异步 setState 不构成级联渲染风险。
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // 脚本类文件：种子脚本依赖尚未生成的 Prisma Client，Worker 是运维入口，
    // 两者保留 console 输出用于人工观察。
    files: ["prisma/seed.ts", "worker/**/*"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "off",
    },
  },
];

export default config;
