import { Element, MemberElement, TypeElement } from "./presentation/server/element";
import { VersionedElement } from "./versioning/versioned-element.model";

export interface ItemNode {
    item: string,
    label: string,
    level: number;
    depth: number;
    lifeRatio: number;
    children: ItemNode[],
    element?: VersionedElement<TypeElement>;
    members?: VersionedElement<MemberElement>[];
    authors?: { [email: string]: number }
}

/** Flat to-do item node with expandable and level information */
export class ItemFlatNode {
    item: string;
    level: number;
    label: string;
    expandable: boolean;
}