import { MethodModel } from "./method.model";
import { TypeModel } from "./type.model";

export interface ClassModel extends TypeModel {
    type: 'CLASS'
    methodsCount: number;
    attributesCount: number;
    superClass: string;
    implementedTypes: string[];
    methods?: MethodModel[];
}