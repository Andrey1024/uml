import { Element } from "./presentation/server/element";

export interface  ItemNode {
    item: string,
    label: string,
    lifeRatio: number,
    level: number;
    depth: number;
    children: ItemNode[],
    element?: Element;
}

/** Flat to-do item node with expandable and level information */
export class ItemFlatNode {
    item: string;
    level: number;
    label: string;
    expandable: boolean;
}