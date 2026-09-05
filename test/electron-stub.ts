import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Stand-in for the `electron` module so main-process code can run under vitest.
 * Aliased in vitest.config.ts.
 *
 * `ipcMain.handle` records handlers in a registry that tests drive through
 * `invokeHandler`, which means the real IPC handlers are exercised rather than
 * reimplemented.
 */

const userData = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-userdata-"));

type Handler = (event: unknown, ...args: unknown[]) => unknown;

const handlers: Record<string, Handler> = {};

export const ipcMain = {
  handle(channel: string, handler: Handler) {
    handlers[channel] = handler;
  },
};

export function invokeHandler(channel: string, ...args: unknown[]) {
  const handler = handlers[channel];
  if (!handler) throw new Error(`No handler registered for "${channel}"`);
  return handler({}, ...args);
}

export function registeredChannels() {
  return Object.keys(handlers).sort();
}

export const openedPaths: string[] = [];

export const shell = {
  async openPath(target: string) {
    openedPaths.push(target);
    return "";
  },
};

export const app = {
  isPackaged: false,
  getPath(name: string) {
    if (name === "userData") return userData;
    if (name === "exe") return path.join(userData, "CataSoft.exe");
    return userData;
  },
  getAppPath() {
    // Fixed, not process.cwd(): tests may chdir to exercise legacy-database
    // discovery, and the real app's appPath never moves.
    return path.resolve(__dirname, "..");
  },
  quit() {},
  whenReady: async () => undefined,
  on() {},
};

export const dialog = {
  errors: [] as { title: string; content: string }[],
  showErrorBox(title: string, content: string) {
    dialog.errors.push({ title, content });
  },
};

export const BrowserWindow = class {};
export const screen = {
  getPrimaryDisplay: () => ({ bounds: { width: 1920, height: 1080 } }),
};

export function userDataDir() {
  return userData;
}
