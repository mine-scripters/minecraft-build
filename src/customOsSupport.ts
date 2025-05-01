import path from 'path';
import os from 'os';
import { MinecraftProduct } from '@minecraft/core-build-tasks';
import { defaultLinuxPath, defaultMacPath, getPlatform, Platform } from './helpers/platform';

export type CustomOsSupportParams = {
  linuxPath?: string;
  macPath?: string;
};

const CUSTOM_OS_SUPPORT_ON = 'on';
const CUSTOM_OS_SUPPORT_ENV = 'CUSTOM_OS_SUPPORT';

export const assertCustomOsSupport = () => {
  if (!isCustomOsSupportEnabled) {
    throw new Error('`customOsSupport` needs to be called after `setupEnvironment` to use this function.');
  }
};

export const isCustomOsSupportEnabled = () => {
  return process.env[CUSTOM_OS_SUPPORT_ENV] === CUSTOM_OS_SUPPORT_ON;
};

export const customOsSupport = (params?: CustomOsSupportParams) => {
  process.env[CUSTOM_OS_SUPPORT_ENV] = CUSTOM_OS_SUPPORT_ON;

  const platform = getPlatform();

  const useVanilla = platform === Platform.WIN || process.env['MINECRAFT_PRODUCT'] === MinecraftProduct.Custom;
  if (useVanilla) {
    return;
  }

  const home = os.homedir();

  process.env['MINECRAFT_PRODUCT'] = MinecraftProduct.Custom;

  if (platform === Platform.LINUX) {
    process.env['CUSTOM_DEPLOYMENT_PATH'] = path.join(home, params?.linuxPath ?? defaultLinuxPath);
  } else if (platform === Platform.MAC) {
    process.env['CUSTOM_DEPLOYMENT_PATH'] = path.join(home, params?.macPath ?? defaultMacPath);
  }
};
