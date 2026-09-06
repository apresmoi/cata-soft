import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Main-process code only. The React UI is deliberately not tested.
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Each file gets its own database/temp dirs; running them in one process
    // keeps the Prisma clients from fighting over the same SQLite files.
    fileParallelism: false,
    alias: {
      electron: path.resolve(__dirname, "test/electron-stub.ts"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      // `src/richText.ts` is the allowlist that lets patient text be stored as
      // markup and printed as markup, so it is held to the same bar as the
      // main process rather than left uncovered.
      include: ["electron/**/*.ts", "src/utils.ts", "src/richText.ts"],
      // main.ts and preload.ts are Electron bootstrap wiring with no logic to
      // assert; electron-env.d.ts is types only. Excluded on purpose rather
      // than padded with tests that would only restate the source.
      exclude: ["electron/main.ts", "electron/preload.ts", "electron/*.d.ts"],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80,
      },
    },
  },
});
