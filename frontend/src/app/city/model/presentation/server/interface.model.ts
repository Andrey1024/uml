import { ElementModel } from "./element.model";
import { MethodModel } from "./method.model";

export interface InterfaceModel extends ElementModel {
    type: 'INTERFACE';
    methodsCount: number;
    attributesCount: number;
    implementedTypes: string[];
    methods?: MethodModel[];
}