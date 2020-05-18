import { ElementModel } from "./element.model";

export interface MethodModel extends ElementModel {
    type: 'METHOD'
    parentClass: string;
    returnType: string;
    parameterTypes: string[];
}