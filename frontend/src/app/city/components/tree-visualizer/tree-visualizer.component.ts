import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { ItemFlatNode, ItemNode } from "../../model/tree-item.model";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { CdkScrollable } from "@angular/cdk/overlay";


@Component({
    selector: 'uml-tree-visualizer',
    templateUrl: './tree-visualizer.component.html',
    styleUrls: ['./tree-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeVisualizerComponent implements OnInit, OnChanges {
    @ViewChild(CdkScrollable) scrollable: CdkScrollable;

    @Input() data: ItemNode[];

    @Input() set selected(nodes: string[]) {
        this.selectedNodes = new Set(nodes);
    };

    @Input() searchString: string;

    @Input() selectedElement: string;

    @Output() select = new EventEmitter<string[]>();

    @Output() setRoot = new EventEmitter<string>();

    @Output() focus = new EventEmitter<string>();

    @Output() details = new EventEmitter<string>();

    flatNodeMap = new Map<ItemFlatNode, ItemNode>();
    nestedNodeMap = new Map<ItemNode, ItemFlatNode>();
    treeControl: FlatTreeControl<ItemFlatNode>;
    treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
    dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;
    selectedNodes: Set<string>;

    /** The selection for checklist */

    constructor() {
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    private selectNodes(...nodes: ItemFlatNode[]) {
        nodes.forEach(name => this.selectedNodes.add(name.item));
    }


    private deselectNodes(...nodes: ItemFlatNode[]) {
        nodes.forEach(name => this.selectedNodes.delete(name.item));

    }

    private toggleSelection(...nodes: ItemFlatNode[]) {
        nodes.forEach(name => {
            if (this.selectedNodes.has(name.item)) {
                this.selectedNodes.delete(name.item);
            } else {
                this.selectedNodes.add(name.item);
            }
        });
    }

    highLight(label: string) {
        if (this.searchString !== '') {
            return label.replace(new RegExp(this.searchString, 'gi'), '<mark>$&</mark>');
        }
        return label;
    }

    isNodeSatisfySearch(node: ItemFlatNode) {
        if (node.expandable) {
            const descendants = this.treeControl.getDescendants(node);
            return descendants.some(n => this.isNodeSatisfySearch(n));
        }
        return node.label.toLowerCase().includes(this.searchString.toLowerCase())
    }

    expandFiltered(node: ItemFlatNode) {
        if (node.expandable) {
            const descendants = this.treeControl.getDescendants(node);
            if (descendants.map(n => this.expandFiltered(n)).some(e => e)) {
                this.treeControl.expand(node);
                return true;
            }
            return false;
        }
        return this.isNodeSatisfySearch(node);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            this.dataSource.data = this.data;
        }
        if (changes.data || changes.searchString) {
            this.data.forEach(i => this.expandFiltered(this.nestedNodeMap.get(i)));
        }
        if (changes.selectedElement && this.selectedElement && this.scrollable) {
            const index = this.treeControl.dataNodes.findIndex(i => i.item === this.selectedElement);
            if (index !== -1) {
                this.scrollable.scrollTo({top: index * 30 - 20});
            }
        }
    }


    ngOnInit(): void {
    }

    getLevel = (node: ItemFlatNode) => node.level;

    isExpandable = (node: ItemFlatNode) => node.expandable;

    getChildren = (node: ItemNode): ItemNode[] => node.children;

    hasChild = (_: number, node: ItemFlatNode) => node.expandable;

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
            this.selectedNodes.has(child.item)
        );
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: ItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.selectedNodes.has(child.item));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    packageSelectionToggle(node: ItemFlatNode): void {
        this.toggleSelection(node);
        const descendants = this.treeControl.getDescendants(node);
        this.selectedNodes.has(node.item)
            ? this.selectNodes(...descendants)
            : this.deselectNodes(...descendants);

        // Force update for the parent
        descendants.every(child =>
            this.selectedNodes.has(child.item)
        );
        this.checkAllParentsSelection(node);
        this.select.emit([...this.selectedNodes]);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    classSelectionToggle(node: ItemFlatNode): void {
        this.toggleSelection(node);
        this.checkAllParentsSelection(node);
        this.select.emit([...this.selectedNodes]);
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
        const nodeSelected = this.selectedNodes.has(node.item);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.some(child =>
            this.selectedNodes.has(child.item)
        );
        if (nodeSelected && !descAllSelected) {
            this.deselectNodes(node);
        } else if (!nodeSelected && descAllSelected) {
            this.selectNodes(node);
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
