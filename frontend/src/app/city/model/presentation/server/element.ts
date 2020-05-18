import { ClassModel } from "./class.model";
import { InterfaceModel } from "./interface.model";
import { EnumModel } from "./enum.model";
import { MethodModel } from "./method.model";

export type Element = InterfaceModel | EnumModel | ClassModel | MethodModel;
export type TypeElement = InterfaceModel | ClassModel | EnumModel;
export type MemberElement = MethodModel;