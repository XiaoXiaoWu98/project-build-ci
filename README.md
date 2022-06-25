## 描述
 一个命令式交互打包工具。同时触发钉钉群聊天机器人发送打包信息

## 使用


```ts
const path = require('path');
const { preBuild } = require('pre-build');

preBuild({
//钉钉聊天群机器人链接配置
  dingTalk: {
    url: 'https://oapi.dingtalk.com/robot/send?access_token=7b9ea47f361fac9efd844b40944d677890cf32ef8a77cee07a02c5714957624d',
    //标签
    asign:
      'SEC0a8309d797702dcb52783676d080b9d7961eeed3c876ea80438fcc0bd535d982',
  },
  //项目路径以及名称
  apps: {
    label: 'pre-build',
    name: 'pre-build',
    projectPath: path.join(__dirname, '../'),
  },
//环境名称以及对应分支名称以及tag前缀
  envs: [
    {
        //环境名称
      name: 'prd',
      //tag前缀
      identifier: '',
      //分支名称
      releaseBranch: 'release',
    },
     {
        //环境名称
      name: 'sit',
      //tag前缀
      identifier: '',
      //分支名称
      releaseBranch: 'sit',
    },
  ],
  //prd环境
  prdAppEnv: 'prd',
});
```

```ts
//package.json  scripts下面添加运行pre-build.js的环境路径
   
 "pre-build": "node ./scripts/pre-build.js"

```

```bash
yarn pre-build prd/sit/dev （环境名称）

```