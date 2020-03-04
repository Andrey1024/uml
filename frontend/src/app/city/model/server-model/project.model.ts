import { PackageModel } from "./package.model";
import { ElementModel } from "./element.model";

export interface ProjectModel {
    name: string,
    version: string,
    data: ElementModel[];
}