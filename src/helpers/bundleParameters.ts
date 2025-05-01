import { getOrThrowFromProcess } from '@minecraft/core-build-tasks';
import fs from 'fs';

interface Module {
  language: string;
}

const getJavascriptEntryPath = () => {
  const projectName = getOrThrowFromProcess('PROJECT_NAME');
  const manifestPath = `behavior_packs/${projectName}/manifest.json`;
  const manifest = JSON.parse(fs.readFileSync(manifestPath).toString());
  const module = manifest.modules.find((m: Module) => m.language === 'javascript');
  if (!module) {
    throw new Error(`Unable to find the javascript module in the manifest: ${manifestPath}`);
  }

  return module.entry;
};

export const findEntrypoint = (): string => {
  const entry = getJavascriptEntryPath();
  return entry.substring(0, entry.lastIndexOf('.js')) + '.ts';
};

export const findOutfile = (): string => {
  return getJavascriptEntryPath();
};
