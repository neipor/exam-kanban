import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null;

// Define the path for the profiles data file
const profilesFilePath = path.join(app.getPath('userData'), 'profiles.json');

// Helper to revive Date objects from string during JSON parsing
function reviveDates(key: string, value: any): any {
  if (key === 'startTime' || key === 'endTime') {
    return new Date(value);
  }
  return value;
}

// IPC handler for loading profiles
ipcMain.handle('load-profiles', async () => {
  try {
    if (fs.existsSync(profilesFilePath)) {
      const data = await fs.promises.readFile(profilesFilePath, 'utf8');
      return JSON.parse(data, reviveDates);
    }
  } catch (error) {
    console.error('Failed to load profiles:', error);
  }
  return []; // Return empty array if file not found or error
});

// IPC handler for saving profiles
ipcMain.handle('save-profiles', async (_event, profiles) => {
  try {
    const dataToSave = JSON.stringify(profiles, null, 2); // Pretty print for debuggability
    await fs.promises.writeFile(profilesFilePath, dataToSave, 'utf8');
  } catch (error) {
    console.error('Failed to save profiles:', error);
    throw error;
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Check if we are in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});