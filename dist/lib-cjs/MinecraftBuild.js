'use strict';

var path = require('path');
var os = require('os');
var coreBuildTasks = require('@minecraft/core-build-tasks');
var justTask = require('just-task');
var fs = require('fs');

exports.Platform = void 0;
(function (Platform) {
    Platform[Platform["WIN"] = 0] = "WIN";
    Platform[Platform["MAC"] = 1] = "MAC";
    Platform[Platform["LINUX"] = 2] = "LINUX";
})(exports.Platform || (exports.Platform = {}));
const getPlatform = () => {
    const platform = os.platform();
    if (platform === 'win32') {
        return exports.Platform.WIN;
    }
    else if (platform === 'darwin') {
        return exports.Platform.MAC;
    }
    else {
        return exports.Platform.LINUX;
    }
};
const defaultLinuxPath = '/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/games/com.mojang/';
const defaultMacPath = '/Library/Application Support/mcpelauncher/games/com.mojang/';

const CUSTOM_OS_SUPPORT_ON = 'on';
const CUSTOM_OS_SUPPORT_ENV = 'CUSTOM_OS_SUPPORT';
const assertCustomOsSupport = () => {
    if (!isCustomOsSupportEnabled) {
        throw new Error('`customOsSupport` needs to be called after `setupEnvironment` to use this function.');
    }
};
const isCustomOsSupportEnabled = () => {
    return process.env[CUSTOM_OS_SUPPORT_ENV] === CUSTOM_OS_SUPPORT_ON;
};
const customOsSupport = (params) => {
    process.env[CUSTOM_OS_SUPPORT_ENV] = CUSTOM_OS_SUPPORT_ON;
    const platform = getPlatform();
    const useVanilla = platform === exports.Platform.WIN || process.env['MINECRAFT_PRODUCT'] === coreBuildTasks.MinecraftProduct.Custom;
    if (useVanilla) {
        return;
    }
    const home = os.homedir();
    process.env['MINECRAFT_PRODUCT'] = coreBuildTasks.MinecraftProduct.Custom;
    if (platform === exports.Platform.LINUX) {
        process.env['CUSTOM_DEPLOYMENT_PATH'] = path.join(home, params?.linuxPath ?? defaultLinuxPath);
    }
    else if (platform === exports.Platform.MAC) {
        process.env['CUSTOM_DEPLOYMENT_PATH'] = path.join(home, params?.macPath ?? defaultMacPath);
    }
};

/**Rename task */
const renameTask = (params) => {
    return () => {
        if (!fs.existsSync(params.source)) {
            throw new Error(`Source file ${params.source} does not exist.`);
        }
        if (fs.existsSync(params.target)) {
            throw new Error(`Target file ${params.target} already exist.`);
        }
        fs.renameSync(params.source, params.target);
    };
};

const addPrefixTask = () => {
    return () => {
        const projectName = coreBuildTasks.getOrThrowFromProcess('PROJECT_NAME');
        let deploymentPath = undefined;
        try {
            const product = coreBuildTasks.getOrThrowFromProcess('MINECRAFT_PRODUCT');
            deploymentPath = coreBuildTasks.getGameDeploymentRootPaths()[product];
        }
        catch (_) {
            throw new Error('Unable to get deployment path. Make sure to configure package root correctly.');
        }
        if (deploymentPath === undefined) {
            throw new Error('Deployment path is undefined. Make sure to configure package root correctly.');
        }
        return justTask.parallel(renameTask({
            source: path.join(deploymentPath, 'development_behavior_packs', projectName),
            target: path.join(deploymentPath, 'development_behavior_packs', `${projectName}_BP`),
        }), renameTask({
            source: path.join(deploymentPath, 'development_resource_packs', projectName),
            target: path.join(deploymentPath, 'development_resource_packs', `${projectName}_RP`),
        }));
    };
};

const getCleanPaths = (rootPath, projectName) => [
    path.join(rootPath, 'development_behavior_packs', projectName),
    path.join(rootPath, 'development_resource_packs', projectName),
    path.join(rootPath, 'development_behavior_packs', `${projectName}_BP`),
    path.join(rootPath, 'development_resource_packs', `${projectName}_RP`),
];
const extractPaths = () => {
    return [
        ...new Set(coreBuildTasks.STANDARD_CLEAN_PATHS.map((cleanPath) => {
            const splitPath = cleanPath.split('/');
            return splitPath.slice(0, -2).join('/'); // Removes development_behavior_packs/PROJECT_NAME
        })),
    ];
};
const cleanCollateralMcpeLauncherTask = () => {
    assertCustomOsSupport();
    const platform = getPlatform();
    const projectName = coreBuildTasks.getOrThrowFromProcess('PROJECT_NAME');
    if (platform === exports.Platform.WIN) {
        return coreBuildTasks.cleanCollateralTask(extractPaths().flatMap((rootPath) => {
            return getCleanPaths(rootPath, projectName);
        }));
    }
    const rootPath = coreBuildTasks.getOrThrowFromProcess('CUSTOM_DEPLOYMENT_PATH');
    return coreBuildTasks.cleanCollateralTask(getCleanPaths(rootPath, projectName));
};

const getJavascriptEntryPath = () => {
    const projectName = coreBuildTasks.getOrThrowFromProcess('PROJECT_NAME');
    const manifestPath = `behavior_packs/${projectName}/manifest.json`;
    const manifest = JSON.parse(fs.readFileSync(manifestPath).toString());
    const module = manifest.modules.find((m) => m.language === 'javascript');
    if (!module) {
        throw new Error(`Unable to find the javascript module in the manifest: ${manifestPath}`);
    }
    return module.entry;
};
const findEntrypoint = () => {
    const entry = getJavascriptEntryPath();
    return entry.substring(0, entry.lastIndexOf('.js')) + '.ts';
};
const findOutfile = () => {
    return getJavascriptEntryPath();
};

exports.addPrefixTask = addPrefixTask;
exports.assertCustomOsSupport = assertCustomOsSupport;
exports.cleanCollateralMcpeLauncherTask = cleanCollateralMcpeLauncherTask;
exports.customOsSupport = customOsSupport;
exports.defaultLinuxPath = defaultLinuxPath;
exports.defaultMacPath = defaultMacPath;
exports.findEntrypoint = findEntrypoint;
exports.findOutfile = findOutfile;
exports.getPlatform = getPlatform;
exports.isCustomOsSupportEnabled = isCustomOsSupportEnabled;
exports.renameTask = renameTask;
//# sourceMappingURL=MinecraftBuild.js.map
