interface configOptions {
    /*! 钉钉群机器人 */
    dingTalk?: {
        url: string;
        asign: string;
    };
    /*! 项目配置 */
    apps: Apps;
    /*! 项目环境配置 */
    envs: Envs[];
    /*! 项目生产环境 */
    prdAppEnv: string;
}
interface Envs {
    /*! 环境名称 */
    name?: string;
    /*! tag后缀 */
    identifier?: string;
    /*! 环境所在的分支代码 */
    releaseBranch?: string;
    /*! 是否是npm包 */
    isNpm?: boolean;
}
interface Apps {
    /*! 标签 */
    label: string;
    /*! 项目名字 */
    name: string;
    /*! 项目路径 */
    projectPath: string;
    /*! 项目版本 */
    version?: string;
}
declare function preBuild(configs: configOptions): Promise<void>;

export { configOptions, preBuild };
