import { ElementModel } from "./element.model";

export interface TypeModel extends ElementModel {
    filePath: string;
    parentPackage: string;
    sourceRoot: string;
}