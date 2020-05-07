import { ElementModel } from "./element.model";

export interface EnumModel extends ElementModel {
    type: 'ENUM';
    fieldsNumber: number;
}