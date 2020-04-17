export class ItemNode {
    constructor(public item: string, public label: string, public children: ItemNode[]) {
    }

}

/** Flat to-do item node with expandable and level information */
export class ItemFlatNode {
    item: string;
    level: number;
    label: string;
    expandable: boolean;
}