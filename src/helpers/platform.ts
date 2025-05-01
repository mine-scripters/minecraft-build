import os from 'os';

export enum Platform {
  WIN,
  MAC,
  LINUX,
}

export const getPlatform = (): Platform => {
  const platform = os.platform();
  if (platform === 'win32') {
    return Platform.WIN;
  } else if (platform === 'darwin') {
    return Platform.MAC;
  } else {
    return Platform.LINUX;
  }
};

export const defaultLinuxPath = '/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/games/com.mojang/';
export const defaultMacPath = '/Library/Application Support/mcpelauncher/games/com.mojang/';
