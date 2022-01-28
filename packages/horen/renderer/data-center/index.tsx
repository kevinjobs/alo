/*
 * @Author       : Kevin Jobs
 * @Date         : 2022-01-15 01:00:44
 * @LastEditTime : 2022-01-28 12:06:06
 * @lastEditors  : Kevin Jobs
 * @FilePath     : \Horen\packages\horen\renderer\data-center\index.tsx
 * @Description  :
 */
const electron = window.require('electron');
const { ipcRenderer } = electron;
import { Track, SettingFile } from 'types';
import { IPC_CODE } from '../../constant';

export class TrackDC {
  public static async getList(path: string, clear?: boolean) {
    return await ipcRenderer.invoke(IPC_CODE.file.getList, path, clear);
  }

  public static async get(p: string): Promise<Track> {
    return await ipcRenderer.invoke(IPC_CODE.file.get, p);
  }

  public static async getMsg() :Promise<string> {
    return new Promise((resolve, reject) => {
      ipcRenderer.on(IPC_CODE.file.get, (evt, msg) => {
        resolve(msg);
      });
    });
  }
}

export class SettingDC {
  public static async get() {
    return await ipcRenderer.invoke(IPC_CODE.setting.get);
  }

  public static async set(setting: SettingFile) {
    return await ipcRenderer.invoke(IPC_CODE.setting.set, setting);
  }
}

export class DialogDC {
  public static async open(flag?: string) {
    return await ipcRenderer.invoke(IPC_CODE.dialog.open, flag);
  }
}
