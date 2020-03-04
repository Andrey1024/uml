import { NodeModel } from "./node.model";

export interface PackageModel extends NodeModel {
    type: 'CONTAINER';

    children: NodeModel[];
}