# Minecraft build 

Minecraft build adds some tasks to what is already provided by `@minecraft/core-build-tasks` to allow building in non windows environments.
Focusing on the paths used by [mcpelauncher](https://mcpelauncher.readthedocs.io/en/latest/).

## Sample just.config.ts file

```typescript
import { argv, parallel, series, task, tscTask } from "just-scripts";
import {
  BundleTaskParameters,
  CopyTaskParameters,
  bundleTask,
  cleanTask,
  coreLint,
  copyTask,
  mcaddonTask,
  setupEnvironment,
  ZipTaskParameters,
  DEFAULT_CLEAN_DIRECTORIES,
  getOrThrowFromProcess,
  watchTask,
} from "@minecraft/core-build-tasks";
import path from "path";
import { customOsSupport, cleanCollateralMcpeLauncherTask, findEntrypoint, findOutfile, addPrefixTask } from "@mine-scripters/minecraft-build";

// Setup env variables
setupEnvironment(path.resolve(__dirname, ".env"));
customOsSupport();
const projectName = getOrThrowFromProcess("PROJECT_NAME");

const bundleTaskOptions: BundleTaskParameters = {
  entryPoint: path.join('scripts', findEntrypoint()),
  external: ["@minecraft/server", "@minecraft/server-ui"],
  outfile: path.join('dist', 'scripts', findOutfile()),
  minifyWhitespace: false,
  sourcemap: true,
  outputSourcemapPath: path.resolve(__dirname, "./dist/debug"),
};

const copyTaskOptions: CopyTaskParameters = {
  copyToBehaviorPacks: [`./behavior_packs/${projectName}`],
  copyToScripts: ["./dist/scripts"],
  copyToResourcePacks: [`./resource_packs/${projectName}`],
};

const mcaddonTaskOptions: ZipTaskParameters = {
  ...copyTaskOptions,
  outputFile: `./dist/packages/${projectName}.mcaddon`,
};

// Lint
task("lint", coreLint(["scripts/**/*.ts"], argv().fix));

// Build
task("typescript", tscTask());
task("bundle", bundleTask(bundleTaskOptions));
task("build", series("typescript", "bundle"));

// Clean
task("clean-local", cleanTask(DEFAULT_CLEAN_DIRECTORIES));
task("clean-collateral", parallel(
    cleanCollateralMcpeLauncherTask(),
));
task("clean", parallel("clean-local", "clean-collateral"));

// Package
task("copyArtifacts", copyTask(copyTaskOptions));
task("package", series("clean-collateral", "copyArtifacts", addPrefixTask()));

// Local Deploy used for deploying local changes directly to output via the bundler. It does a full build and package first just in case.
task(
  "local-deploy",
  watchTask(
    ["scripts/**/*.ts", "behavior_packs/**/*.{json,lang,png}", "resource_packs/**/*.{json,lang,png}"],
    series("clean-local", "build", "package")
  )
);

// Mcaddon
task("createMcaddonFile", mcaddonTask(mcaddonTaskOptions));
task("mcaddon", series("clean-local", "build", "createMcaddonFile"));
```
