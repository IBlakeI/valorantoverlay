import { app, shell, BrowserWindow, Menu, ipcMain, screen } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const SETTINGS_WIDTH = 500;
  const SETTINGS_HEIGHT = 750;
  const GAP = 10;

  const mainBounds = mainWindow?.getBounds();

  let x: number;
  let y: number;

  if (mainBounds) {
    // Find the display containing the main window.
    const display = screen.getDisplayMatching(mainBounds);
    const workArea = display.workArea;

    // Center Settings horizontally relative to the main window.
    x = mainBounds.x + Math.round((mainBounds.width - SETTINGS_WIDTH) / 2);

    // Prefer opening below the main window.
    y = mainBounds.y + mainBounds.height + GAP;

    // If there's not enough room below, open above it.
    if (y + SETTINGS_HEIGHT > workArea.y + workArea.height) {
      y = mainBounds.y - SETTINGS_HEIGHT - GAP;
    }

    // Keep the window inside the horizontal work area.
    x = Math.max(
      workArea.x,
      Math.min(x, workArea.x + workArea.width - SETTINGS_WIDTH),
    );

    // Keep it inside vertically too.
    y = Math.max(
      workArea.y,
      Math.min(y, workArea.y + workArea.height - SETTINGS_HEIGHT),
    );
  } else {
    // Fallback if the main window doesn't exist.
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    x = workArea.x + Math.round((workArea.width - SETTINGS_WIDTH) / 2);
    y = workArea.y + Math.round((workArea.height - SETTINGS_HEIGHT) / 2);
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    x,
    y,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    settingsWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/settings`);
  } else {
    settingsWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "settings",
    });
  }

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [];

  // macOS application menu
  if (process.platform === "darwin") {
    template.push({
      label: app.name,
      submenu: [
        {
          role: "about",
        },
        {
          type: "separator",
        },
        {
          role: "quit",
        },
      ],
    });
  }

  // Settings menu
  template.push({
    label: "Settings",
    submenu: [
      {
        label: "Open Settings",
        accelerator: "CommandOrControl+,",
        click: () => {
          createSettingsWindow();
        },
      },
    ],
  });

  // Development menu
  if (is.dev) {
    template.push({
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CommandOrControl+R",
          click: () => {
            mainWindow?.webContents.reload();
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CommandOrControl+Shift+I",
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 190,
    minWidth: 350,
    maxWidth: 450,
    minHeight: 165,
    maxHeight: 190,
    show: false,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;

    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }

    app.quit();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);

    return {
      action: "deny",
    };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createApplicationMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

export interface Config {
  showNameAndTag: boolean;
  selectedRegion: string;
  riotName: string;
  riotTag: string;
  selectedFont: string;
}

export const defaultConfig: Config = {
  showNameAndTag: true,
  selectedRegion: "NA",
  riotName: "",
  riotTag: "",
  selectedFont: "sans-serif",
};

let config: Config = defaultConfig;

ipcMain.on("config-updated", (_event, updatedConfig: Config) => {
  console.log("Config received by main:", updatedConfig);

  config = { ...config, ...updatedConfig };

  console.log("Config stored by main:", config);

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("config-updated", config);
  }
});
