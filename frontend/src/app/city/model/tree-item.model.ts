export class ItemNode {
    children: ItemNode[];
    label: string;

    constructor(public item: string) {
    }

}

/** Flat to-do item node with expandable and level information */
export class ItemFlatNode {
    item: string;
    level: number;
    label: string;
    expandable: boolean;
}