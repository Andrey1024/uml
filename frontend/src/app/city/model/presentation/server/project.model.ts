import { Element } from "./element";

export interface ProjectModel {
    repositoryName: string;
    commit: string;
    data: Element[];
}