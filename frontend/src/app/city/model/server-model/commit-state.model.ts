import { Element } from "./element";

export interface CommitState {
    sourceRoots: string[];
    data: Element[];
}