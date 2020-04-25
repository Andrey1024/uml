import { ElementModel } from "./element.model";

export interface NodeModel extends ElementModel {
    authors: { [email: string]: number };
    sourceRoot: string;
}