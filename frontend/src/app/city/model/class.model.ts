import {Node} from "./node.model";

export interface Class extends Node {
    type: "CLASS";
    methodsCount: number;
    attributesCount: number;
}