import { ElementModel } from "./element.model";

export interface ClassModel extends ElementModel {
    type: 'CLASS'
    methodsCount: number;
    attributesCount: number;
}