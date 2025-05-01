import { getGameDeploymentRootPaths, getOrThrowFromProcess, MinecraftProduct } from '@minecraft/core-build-tasks';
import { parallel } from 'just-task';
import { renameTask } from './rename';
import path from 'path';

export const addPrefixTask = () => {
  return () => {
    const projectName = getOrThrowFromProcess('PROJECT_NAME');

    let deploymentPath: string | undefined = undefined;
    try {
      const product = getOrThrowFromProcess<MinecraftProduct>('MINECRAFT_PRODUCT');
      deploymentPath = getGameDeploymentRootPaths()[product];
    } catch (_) {
      throw new Error('Unable to get deployment path. Make sure to configure package root correctly.');
    }

    if (deploymentPath === undefined) {
      throw new Error('Deployment path is undefined. Make sure to configure package root correctly.');
    }

    return parallel(
      renameTask({
        source: path.join(deploymentPath, 'development_behavior_packs', projectName),
        target: path.join(deploymentPath, 'development_behavior_packs', `${projectName}_BP`),
      }),
      renameTask({
        source: path.join(deploymentPath, 'development_resource_packs', projectName),
        target: path.join(deploymentPath, 'development_resource_packs', `${projectName}_RP`),
      })
    );
  };
};
