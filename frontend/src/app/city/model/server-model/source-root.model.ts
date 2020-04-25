import { Element } from "./element";

export interface SourceRoot {
    repoName: string;
    commit: string;
    data: Element[];
}