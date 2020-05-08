import { ElementModel } from "./element.model";

export interface EnumModel extends ElementModel {
    type: 'ENUM';
    numberOfConstants: number;
}