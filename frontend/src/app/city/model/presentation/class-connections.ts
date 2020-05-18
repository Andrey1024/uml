import { ClassModel } from "./server/class.model";

export interface ClassConnections extends ClassModel {
    descendant?: string;
}