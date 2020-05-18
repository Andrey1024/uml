import { ClassConnections } from "./class-connections";
import { InterfaceConnections } from "./interface-connections";
import { EnumModel } from "./server/enum.model";

export type ElementConnections = ClassConnections | InterfaceConnections | EnumModel;