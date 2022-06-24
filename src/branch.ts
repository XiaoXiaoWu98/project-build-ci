import  execa from 'execa';
/** 获取当前分支 */
export async function getCurrentBranch() {
  try {
    const { stdout } = await execa('git', [
      `rev-parse`,
      '--abbrev-ref',
      'HEAD',
    ]);
    return stdout;
  } catch (err) {
    console.log(err);
  }
}
