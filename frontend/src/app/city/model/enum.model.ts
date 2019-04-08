import {Node} from "./node.model";

export interface Enum extends Node {
    type: "ENUM";
}