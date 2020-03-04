import { NodeModel } from "./node.model";

export interface ClassModel extends NodeModel {
    type: 'CLASS'
    methodsCount: number;
    attributesCount: number;
}