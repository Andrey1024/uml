import { TypeModel } from "./type.model";

export interface EnumModel extends TypeModel {
    type: 'ENUM';
    numberOfConstants: number;
}