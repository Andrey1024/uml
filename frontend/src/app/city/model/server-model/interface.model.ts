import { NodeModel } from "./node.model";

export interface InterfaceModel extends NodeModel {
    type: 'INTERFACE';
    methodsCount: number;
    attributesCount: number;
}