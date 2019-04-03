import {Node} from "./node.model";

export interface Container extends Node {
    type: "CONTAINER";
    children: Node[];
}