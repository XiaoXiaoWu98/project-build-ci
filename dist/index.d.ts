interface configOptions {
    dingTalk?: {
        url: string;
        asign: string;
    };
    apps: Apps;
    envs: Envs[];
    prdAppEnv: string;
}
interface Envs {
    name?: string;
    identifier?: string;
    releaseBranch?: string;
}
interface Apps {
    label: string;
    name: string;
    projectPath: string;
    version?: string;
}
declare function preBuild(configs: configOptions): Promise<void>;

export { configOptions, preBuild };
