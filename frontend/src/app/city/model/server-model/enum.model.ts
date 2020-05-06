import { NodeModel } from "./node.model";

export interface EnumModel extends NodeModel {
    type: 'ENUM';
    fieldsNumber: number;
}