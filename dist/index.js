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
var src_exports = {};
__export(src_exports, {
  preBuild: () => preBuild
});
module.exports = __toCommonJS(src_exports);

// src/dingNotify.ts
var import_axios = __toESM(require("axios"));
var import_chalk = __toESM(require("chalk"));
var import_crypto = __toESM(require("crypto"));
async function request(url, options) {
  const res = await import_axios.default.post(url, options, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res;
}
async function handleUrlAsign(dingWebHook, secret) {
  var time = Date.now();
  var stringToSign = time + "\n" + secret;
  var base = import_crypto.default.createHmac("sha256", secret).update(stringToSign).digest("base64");
  var sign = encodeURIComponent(base);
  const url = dingWebHook + `&timestamp=${time}&sign=${sign}`;
  return url;
}
function notify(dingtalkWebhook, msg, title = "[\u6253\u5305\u4FE1\u606F]") {
  try {
    request(dingtalkWebhook, {
      msgtype: "markdown",
      markdown: {
        title,
        text: msg
      }
    });
  } catch (error) {
    console.log(import_chalk.default.bgRed(`\u9489\u9489\u673A\u5668\u4EBA\u7B11\u6B7B\u63A8\u9001\u5931\u8D25 ${error}`));
  }
}

// src/index.ts
var chalk2 = require("chalk");
var logSymbols = require("log-symbols");
var path = require("path");
var fs = require("fs");
var yargs = require("yargs");
var enquirer = require("enquirer");
var semver = require("semver");
var simplegit = require("simple-git");
var branch = (init_branch(), __toCommonJS(branch_exports));
var exec = require("child_process").exec;
var execa2 = require("execa");
function nextVersion(version, releaseType = "patch", identifier = "") {
  return semver.inc(version, releaseType, identifier);
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
  const {
    apps,
    dingTalk,
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
  const envConfig = envs.find((v) => v.name === appEnv) || {};
  const versionIdentifier = envConfig.identifier || "";
  const releaseBranch = envConfig.releaseBranch;
  if (releaseBranch) {
    const curBranch = await branch.getCurrentBranch();
    if (curBranch !== releaseBranch) {
      console.log(chalk2.bgRed(`\u5F53\u524D\u5206\u652F\u548C\u5F53\u524D appEnv:${appEnv} \u7684\u53D1\u5E03\u5206\u652F\u4E0D\u5339\u914D!(${curBranch}!==${releaseBranch})`));
      return;
    }
    try {
      const selectVersion = await enquirer.prompt({
        name: apps.name,
        message: `\u8BF7\u8F93\u5165${apps.label}\u8981\u6253\u5305\u7684\u7248\u672C[\u5F53\u524D\uFF1A${packageJson.version}]`,
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
      if (!selectVersion)
        return console.log(chalk2.red("\u53D6\u6D88\u6253\u5305"));
      apps.version = await nextVersion(curVersion, selectVersion[apps.name], versionIdentifier);
    } catch (err) {
      console.log(err);
    }
    if (!apps.version) {
      return;
    }
    const answers = await enquirer.prompt([
      {
        name: "confirm",
        message: `\u662F\u5426\u786E\u8BA4\u6253\u5305 ${apps.name}: ${apps.version}`,
        type: "confirm"
      }
    ]);
    if (!answers.confirm)
      return console.log(chalk2.red("\u53D6\u6D88\u6253\u5305"));
    if (!semver.valid(apps.version))
      return console.log(logSymbols.error, chalk2.red("\u7248\u672C\u53F7\u683C\u5F0F\u9519\u8BEF"));
    await changeVersion(apps.version, packageJson, packageJsonPath);
    try {
      await git.add(apps.projectPath + "/*");
      await git.commit(`prebuild: ${apps.version}`);
      console.log(logSymbols.success, chalk2.green("\u63A8\u9001\u4EE3\u7801\u5230\u8FDC\u7A0B\u4E2D"));
      await git.push("origin", releaseBranch);
      console.log(logSymbols.success, chalk2.green("\u63A8\u9001\u4EE3\u7801\u6210\u529F"));
      await git.tag([`${apps.version}`]);
      await git.push(["origin", `${apps.version}`]);
      console.log(logSymbols.success, chalk2.green("\u63A8\u9001tag\u6210\u529F"));
      if (dingTalk) {
        const url = await handleUrlAsign(dingTalk.url, dingTalk.asign);
        const msg = `
## \u{1F389}\u{1F389} [${apps.name}] \u6253\u5305\u6210\u529F \u{1F973} 
- version: **${apps.version}** ;
- \u64CD\u4F5C\u4EBA: ${process.env.GITLAB_USER_NAME || process.env.USER}
;`;
        notify(url, msg, apps.name);
      }
      if (appEnv === prdAppEnv && envConfig.isNpm) {
        exec("npm publish", (err, stdout, stderr) => {
          if (err) {
            console.log(chalk2.bgRed(`npm\u5305\u63A8\u9001\u5931\u8D25 ${err}`));
          } else {
            console.log(logSymbols.success, chalk2.green(`\u63A8\u9001npm\u5305: ${apps.name}\u6210\u529F\uFF0C--version: ${apps.version}`));
          }
        });
      }
    } catch (err) {
      if (dingTalk) {
        const url = await handleUrlAsign(dingTalk.url, dingTalk.asign);
        const msg = `
## \u{1F389}\u{1F389} [${apps.name}] 
- \u6253\u5305\u5931\u8D25 \u{1F62D}\u{1F62D} version: **${apps.version}** ;
- \u64CD\u4F5C\u4EBA: ${process.env.GITLAB_USER_NAME || process.env.USER} ;
- \u539F\u56E0: git\u63D0\u4EA4\u5931\u8D25: ${err}
;`;
        notify(url, msg, apps.name);
      }
      console.log(`\u63A8\u9001\u8FDC\u7A0B\u5931\u8D25: + ${err}`);
    }
    return;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  preBuild
});
