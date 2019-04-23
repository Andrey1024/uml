import {Node} from "./node.model";

export interface Interface extends Node  {
    type: "INTERFACE";
    methodsCount: number;
}