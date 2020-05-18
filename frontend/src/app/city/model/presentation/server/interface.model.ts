import { MethodModel } from "./method.model";
import { TypeModel } from "./type.model";

export interface InterfaceModel extends TypeModel {
    type: 'INTERFACE';
    methodsCount: number;
    attributesCount: number;
    implementedTypes: string[];
    methods?: MethodModel[];
}