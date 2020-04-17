import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { ItemFlatNode, ItemNode } from "../../model/tree-item.model";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";


@Component({
    selector: 'uml-tree-visualizer',
    templateUrl: './tree-visualizer.component.html',
    styleUrls: ['./tree-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeVisualizerComponent implements OnInit, OnChanges {
    @Input() data: ItemNode[];

    @Input() selected: Set<string>;

    @Output() select = new EventEmitter<string[]>();

    @Output() setRoot = new EventEmitter<string>();

    @Output() focus = new EventEmitter<string>();

    flatNodeMap = new Map<ItemFlatNode, ItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<ItemNode, ItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: ItemFlatNode | null = null;

    treeControl: FlatTreeControl<ItemFlatNode>;

    treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;

    dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;

    /** The selection for checklist */

    constructor() {
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    private selectNodes(...names: string[]) {
        names.forEach(name => this.selected.add(name));
    }


    private deselectNodes(...names: string[]) {
        names.forEach(name => this.selected.delete(name));
    }

    private toggleSelection(...names: string[]) {
        names.forEach(name => {
            if (this.selected.has(name)) {
                this.selected.delete(name);
            } else {
                this.selected.add(name);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource.data = this.data;
    }

    ngOnInit(): void {
        this.treeControl.expandAll();
    }

    getLevel = (node: ItemFlatNode) => node.level;

    isExpandable = (node: ItemFlatNode) => node.expandable;

    getChildren = (node: ItemNode): ItemNode[] => node.children;

    hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: ItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.item === node.item
            ? existingNode
            : new ItemFlatNode();
        flatNode.item = node.item;
        flatNode.level = level;
        flatNode.label = node.label;
        flatNode.expandable = !!node.children;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: ItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        return descendants.every(child =>
            this.selected.has(child.item)
        );
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: ItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.selected.has(child.item));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: ItemFlatNode): void {
        this.toggleSelection(node.item);
        const descendants = this.treeControl.getDescendants(node);
        this.selected.has(node.item)
            ? this.selectNodes(...descendants.map(d => d.item))
            : this.deselectNodes(...descendants.map(d => d.item));

        // Force update for the parent
        descendants.every(child =>
            this.selected.has(child.item)
        );
        this.checkAllParentsSelection(node);
        this.select.emit([...this.selected]);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: ItemFlatNode): void {
        this.toggleSelection(node.item);
        this.checkAllParentsSelection(node);
        this.select.emit([...this.selected]);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: ItemFlatNode): void {
        let parent: ItemFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: ItemFlatNode): void {
        const nodeSelected = this.selected.has(node.item);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.some(child =>
            this.selected.has(child.item)
        );
        if (nodeSelected && !descAllSelected) {
            this.deselectNodes(node.item);
        } else if (!nodeSelected && descAllSelected) {
            this.selectNodes(node.item);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: ItemFlatNode): ItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }
}
