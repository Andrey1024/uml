import { ClassModel } from "./server-model/class.model";
import { NodeVersioned } from "./node-versioned.model";

export interface ClassVersioned extends NodeVersioned<ClassModel> {
}
