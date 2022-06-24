var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/branch.ts
var branch_exports = {};
__export(branch_exports, {
  getCurrentBranch: () => getCurrentBranch
});
async function getCurrentBranch() {
  try {
    const { stdout } = await (0, import_execa.default)("git", [
      `rev-parse`,
      "--abbrev-ref",
      "HEAD"
    ]);
    return stdout;
  } catch (err) {
    console.log(err);
  }
}
var import_execa;
var init_branch = __esm({
  "src/branch.ts"() {
    import_execa = __toESM(require("execa"));
  }
});

// src/index.ts
var chalk = require("chalk");
var logSymbols = require("log-symbols");
var path = require("path");
var fs = require("fs");
var yargs = require("yargs");
var enquirer = require("enquirer");
var semver = require("semver");
var simplegit = require("simple-git");
var branch = (init_branch(), __toCommonJS(branch_exports));
function nextVersion(version, releaseType = "patch", identifier = "") {
  return semver.default.inc(version, releaseType, identifier);
}
function changeVersion(version, pkgConfig, pkgConfigFile) {
  version = String(version).trim();
  return new Promise((resolve, reject) => {
    if (version.trim() === pkgConfig.version) {
      resolve(version);
      return version;
    }
    pkgConfig.version = version;
    const packageJSON = JSON.stringify(pkgConfig, null, 4) + "\n";
    fs.writeFile(pkgConfigFile, packageJSON, "utf8", (err) => {
      if (err) {
        return reject(err);
      }
      resolve(version);
    });
  });
}
async function preBuild(configs) {
  const git = simplegit();
  const diff = await git.diff();
  if (diff)
    return console.log(logSymbols.error, chalk.red("\u5F53\u524D\u6709\u672A\u63D0\u4EA4\u7684\u4FEE\u6539"));
  const {
    apps = {},
    envs = [
      { name: "dev", identifier: "dev" },
      { name: "sit", identifier: "rc" },
      { name: "deploy", identifier: "" }
    ],
    prdAppEnv = "deploy"
  } = configs;
  const envNames = envs.map((v) => v.name);
  if (!apps.projectPath)
    return;
  const packageJsonPath = path.join(apps.projectPath, "./package.json");
  const packageJson = require(packageJsonPath);
  const curVersion = packageJson.version;
  const args = yargs.usage("$0 <appEnv>", "\u6784\u5EFA\u524D\u51C6\u5907", (y) => {
    y.positional("appEnv", {
      describe: "App Env",
      choices: envNames
    }).option("remote", {
      description: "\u8FDC\u7AEF\u4ED3\u5E93\u7684\u540D\u79F0\uFF0C\u9ED8\u8BA4\u662F origin",
      default: "origin"
    });
  }).version(false).help().argv;
  const appEnv = args.appEnv;
  const envConfig = envs.find((v) => v.name === appEnv);
  const versionIdentifier = envConfig.identifier || "";
  const releaseBranch = envConfig.releaseBranch;
  if (releaseBranch) {
    const curBranch = await branch.getCurrentBranch();
    if (curBranch !== releaseBranch) {
      console.log(chalk.bgRed(`\u5F53\u524D\u5206\u652F\u548C\u5F53\u524D appEnv:${appEnv} \u7684\u53D1\u5E03\u5206\u652F\u4E0D\u5339\u914D!(${curBranch}!==${releaseBranch})`));
      return;
    }
    try {
      const answers2 = await enquirer.prompt({
        name: apps.name,
        message: `\u8BF7\u8F93\u5165${apps.label}\u8981\u6253\u5305\u7684\u7248\u672C[\u5F53\u524D\uFF1A${apps.packageJson.version}]`,
        type: "select",
        choices: function() {
          if (appEnv === prdAppEnv) {
            return [
              {
                message: "patch(\u5C0F\u7248\u672C)",
                name: "patch"
              },
              {
                message: "minor(\u4E2D\u7248\u672C)",
                name: "minor"
              },
              {
                message: "major(\u5927\u7248\u672C)",
                name: "major"
              }
            ];
          } else {
            return [
              {
                message: "prerelease(build \u52A0\u4E00)",
                name: "prerelease"
              },
              {
                message: "prepatch(\u5C0F\u7248\u672C)",
                name: "prepatch"
              },
              {
                message: "preminor(\u4E2D\u7248\u672C)",
                name: "preminor"
              },
              {
                message: "premajor(\u5927\u7248\u672C)",
                name: "premajor"
              }
            ];
          }
        },
        format: function(value) {
          return nextVersion(curVersion, value, versionIdentifier);
        },
        initial: appEnv === prdAppEnv ? "patch" : "prerelease"
      });
      apps.version = nextVersion(curVersion, answers2[apps.name], versionIdentifier);
    } catch (err) {
      console.log(err);
    }
    const answers = await enquirer.prompt([
      {
        name: "confirm",
        message: `\u662F\u5426\u786E\u8BA4\u6253\u5305 ${apps.name}: ${apps.version}`,
        type: "confirm"
      }
    ]);
    if (!answers)
      return console.log(chalk.red("\u53D6\u6D88\u6253\u5305"));
    if (!semver.valid(apps.version))
      return console.log(logSymbols.error, chalk.red("\u7248\u672C\u53F7\u683C\u5F0F\u9519\u8BEF"));
    await changeVersion(apps.version, apps.packageJson, packageJsonPath), await git.add(apps.projectPath);
    await git.commit(`prebuild: v${nextVersion}`);
    await git.push("origin", releaseBranch);
    console.log(logSymbols.success, chalk.green("\u63A8\u9001\u4EE3\u7801\u6210\u529F"));
    const isExist = await git.show(`v${nextVersion}`);
    if (!isExist)
      await git.tag([`v${nextVersion}`]);
    await git.push(["origin", `v${nextVersion}`]);
    console.log(logSymbols.success, chalk.green("\u63A8\u9001tag\u6210\u529F"));
    return;
  }
}
exports.preBuild = preBuild;
