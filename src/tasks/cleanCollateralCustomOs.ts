import { cleanCollateralTask, getOrThrowFromProcess, STANDARD_CLEAN_PATHS } from '@minecraft/core-build-tasks';
import { getPlatform, Platform } from '../helpers/platform';
import path from 'path';
import { assertCustomOsSupport } from '../customOsSupport';

const getCleanPaths = (rootPath: string, projectName: string) => [
  path.join(rootPath, 'development_behavior_packs', projectName),
  path.join(rootPath, 'development_resource_packs', projectName),
  path.join(rootPath, 'development_behavior_packs', `${projectName}_BP`),
  path.join(rootPath, 'development_resource_packs', `${projectName}_RP`),
];

const extractPaths = (): Array<string> => {
  return [
    ...new Set(
      STANDARD_CLEAN_PATHS.map((cleanPath) => {
        const splitPath = cleanPath.split('/');
        return splitPath.slice(0, -2).join('/'); // Removes development_behavior_packs/PROJECT_NAME
      })
    ),
  ];
};

export const cleanCollateralMcpeLauncherTask = () => {
  assertCustomOsSupport();
  const platform = getPlatform();

  const projectName = getOrThrowFromProcess('PROJECT_NAME');

  if (platform === Platform.WIN) {
    return cleanCollateralTask(
      extractPaths().flatMap((rootPath) => {
        return getCleanPaths(rootPath, projectName);
      })
    );
  }

  const rootPath = getOrThrowFromProcess('CUSTOM_DEPLOYMENT_PATH');
  return cleanCollateralTask(getCleanPaths(rootPath, projectName));
};
