const path = require('path');
const { preBuild } = require('../dist/index');

preBuild({
  apps: {
    label: 'pre-build',
    name: 'pre-build',
    projectPath: path.join(__dirname, '../'),
  },

  envs: [
    {
      name: 'prd',
      identifier: '',
      releaseBranch: 'release'
    },
  ],
  prdAppEnv: 'prd',
});
