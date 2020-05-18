import { InterfaceModel } from "./server/interface.model";

export interface InterfaceConnections extends InterfaceModel {
    implementers?: string[];
}