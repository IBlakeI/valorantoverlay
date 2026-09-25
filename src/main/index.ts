import { app, shell, BrowserWindow, Menu, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

function createSettingsWindow(): void {
  // If settings is already open, focus it instead of creating another one.
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 750,
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
  const template: Electron.MenuItemConstructorOptions[] = [
    {
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
    },
  ];

  // Add developer options in development.
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
    height: 165,
    minWidth: 350,
    maxWidth: 450,
    minHeight: 165,
    maxHeight: 175,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
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
