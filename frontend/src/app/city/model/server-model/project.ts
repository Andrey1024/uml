import { Element } from "./element";

export interface Project {
    repositoryName: string;
    commit: string;
    data: Element[];
}