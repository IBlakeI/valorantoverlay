"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const icon = path.join(__dirname, "../../resources/icon.png");
let mainWindow = null;
let settingsWindow = null;
function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }
  settingsWindow = new electron.BrowserWindow({
    width: 500,
    height: 750,
    resizable: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    settingsWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/settings`);
  } else {
    settingsWindow.loadFile(path.join(__dirname, "../renderer/index.html"), {
      hash: "settings"
    });
  }
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}
function createApplicationMenu() {
  const template = [
    {
      label: "Settings",
      submenu: [
        {
          label: "Open Settings",
          accelerator: "CommandOrControl+,",
          click: () => {
            createSettingsWindow();
          }
        }
      ]
    }
  ];
  if (utils.is.dev) {
    template.push({
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CommandOrControl+R",
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CommandOrControl+Shift+I",
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          }
        }
      ]
    });
  }
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 400,
    height: 165,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return {
      action: "deny"
    };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createApplicationMenu();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
const defaultConfig = {
  showNameAndTag: true,
  selectedRegion: "NA",
  riotName: "",
  riotTag: "",
  selectedFont: "sans-serif"
};
let config = defaultConfig;
electron.ipcMain.on("config-updated", (_event, updatedConfig) => {
  console.log("Config received by main:", updatedConfig);
  config = { ...config, ...updatedConfig };
  console.log("Config stored by main:", config);
  for (const window of electron.BrowserWindow.getAllWindows()) {
    window.webContents.send("config-updated", config);
  }
});
exports.defaultConfig = defaultConfig;
