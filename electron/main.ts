import { app, BrowserWindow, dialog, screen } from "electron";
import { autoUpdater } from "electron-updater";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { registerIpcHandlers } from "./controller";
import { initDatabase } from "./database";

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let loadingScreen: BrowserWindow | null;

/**
 * Quiet start: skip the always-on-top splash and open the window minimized and
 * unfocused, so a dev session does not take over the screen on every reload.
 *
 * Default ON while a Vite dev server is attached, OFF in shipped builds -- the
 * clinic still gets the splash and a maximized window. Override either way with
 * CATASOFT_START_MINIMIZED=1 / =0.
 */
const startMinimized =
  process.env.CATASOFT_START_MINIMIZED === "1" ||
  (process.env.CATASOFT_START_MINIMIZED !== "0" && !!VITE_DEV_SERVER_URL);

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  if (!startMinimized) {
    loadingScreen = new BrowserWindow({
      width: 125,
      height: 125,
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
      skipTaskbar: true,
    });

    loadingScreen.loadFile(path.join(process.env.VITE_PUBLIC, "loading.html"));
  }

  win = new BrowserWindow({
    show: false,
    x: 0,
    y: 0,
    width,
    height,
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // win.webContents.openDevTools();

  // The uploads directory is owned by ./database (under userData); nothing to
  // create here. It used to be created next to the bundled code, which is a
  // different path than the one the writer actually used.

  win.once("ready-to-show", () => {
    if (startMinimized) {
      // Stay fully hidden: showing then minimizing flashes the window on
      // every dev reload. Click the dock/taskbar icon to bring it up.
      win?.setMenuBarVisibility(false);
      console.log("[window] quiet start: hidden. Activate the app to show it.");
      return;
    }

    setTimeout(() => {
      loadingScreen?.close();

      if (win) {
        win.setMenuBarVisibility(false);
        win.resizable = false;
        win.show();
        win.maximize();
      }
    }, 2500);
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    return;
  }

  // Quiet start leaves the window hidden; activating is how you ask for it.
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});

async function bootstrap() {
  await app.whenReady();

  try {
    const result = await initDatabase();
    console.log("[db] ready", result);
  } catch (error) {
    // Fail closed: never serve a half-migrated patient database.
    dialog.showErrorBox(
      "No se pudo preparar la base de datos",
      error instanceof Error ? error.message : String(error)
    );
    app.quit();
    return;
  }

  registerIpcHandlers();
  createWindow();

  // Check for updates after the window is created
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error("Failed to check for updates:", err);
    });
  }
}

bootstrap();
