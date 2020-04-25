import { ElementModel } from "./element.model";

export interface InterfaceModel extends ElementModel {
    type: 'INTERFACE';
    methodsCount: number;
    attributesCount: number;
}