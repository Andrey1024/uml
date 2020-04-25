import { ElementModel } from "./element.model";

export interface PackageModel extends ElementModel {
    type: 'CONTAINER';

    children: string[];
}