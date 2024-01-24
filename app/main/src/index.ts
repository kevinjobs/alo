import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';

import { createMainWindow } from './app';
import { AUDIO_EXTS, CHANNELS } from './constant';
import { handleRefreshTrackList, handleWriteLibraries } from './ipc';
import {
  DBDataType,
  initDatabase,
  initLogger,
  readMusicMeta,
  walkDir,
} from './utils';

import type { Low } from 'lowdb';
import type { Logger } from 'winston';

export let mainWindow: BrowserWindow = null;
export let db: Low<DBDataType> = null;
export let logger: Logger = null;

app.whenReady().then(async () => {
  logger = initLogger();
  db = await initDatabase();
  mainWindow = createMainWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('walk-dir', async (evt, dir: string) => {
  const files = await walkDir(dir);
  return files.map((file) => file);
});

ipcMain.handle('get-a-file', async (evt, filename: string) => {
  const base64 = await fs.readFile(filename, {
    encoding: 'base64',
  });
  return 'data:audio/wav;base64,' + base64;
});

ipcMain.handle('open-dialog', async (evt) => {
  return await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'multiSelections'],
  });
});

ipcMain.handle(CHANNELS.setSetting, async (evt, key: string, value: any) => {
  await db.update(({ setting }) => (setting[key] = value));

  db.data.tracks = [];
  await db.write();

  if (key === 'libraries' && value instanceof Array) {
    const files = [];

    for (const lib of value) {
      const paths = await walkDir(lib);
      paths.forEach((p) => {
        if (!AUDIO_EXTS.includes(p.split('.').pop())) return;
        files.push(p);
        console.log(p);
      });
    }

    for (const file of files) {
      await db.update(({ tracks }) => {
        tracks?.push(file);
      });
    }
  }
});

ipcMain.handle(CHANNELS.getSetting, async (evt, key: string) => {
  await db.read();
  return db.data.setting[key];
});

ipcMain.handle(CHANNELS.getTrackList, async () => {
  await db.read();
  return db.data.tracks;
});

ipcMain.handle(CHANNELS.getTrack, async (evt, trackSource: string) => {
  if (typeof trackSource === 'string') {
    return await readMusicMeta(trackSource);
  }
});

ipcMain.handle(CHANNELS.closeMainWindow, async (evt) => {
  mainWindow.destroy();
});

ipcMain.handle(CHANNELS.writeLibraries, handleWriteLibraries);

ipcMain.handle(CHANNELS.refreshTrackList, handleRefreshTrackList);
