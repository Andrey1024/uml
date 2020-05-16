import { ElementModel } from "./element.model";
import { MethodModel } from "./method.model";

export interface ClassModel extends ElementModel {
    type: 'CLASS'
    methodsCount: number;
    attributesCount: number;
    superClass: string;
    implementedTypes: string[];
    methods?: MethodModel[];
}