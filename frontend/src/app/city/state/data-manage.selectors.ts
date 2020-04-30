import { createSelector } from "@ngxs/store";
import { mapValues, set } from "lodash-es";
import { RepositoryState } from "./repository.state";
import { Hierarchy } from "../model/hierarchy.model";
import { Element } from "../model/server-model/element";
import { ItemNode } from "../model/tree-item.model";


function collapse(hierarchy): Hierarchy {
    return Object.keys(hierarchy).reduce((result, path) => {
        let child = hierarchy[path];
        let name = path;
        let children = Object.keys(child);
        while (children.length === 1 && !child[children[0]].type) {
            name = `${name}.${children[0]}`;
            child = child[children[0]];
            children = Object.keys(child);
        }
        result[name] = child;
        return result
    }, {})
}

function createHierarchy(elements: Element[]): Hierarchy {
    let packageMap: Hierarchy = {};
    for (const element of elements) {
        set(packageMap, element.fullPath, element);
    }

    return collapse(packageMap);
}

// function createTreeNew(elements: Element[]): ItemNode[] {
//     const nodesMap = new Map<string, ItemNode>();
//     for (const element of elements) {
//         const elNode = new ItemNode(element.fullPath, element.name, null);
//         if (!nodesMap.has(element.parentPackage)) {
//             nodesMap.set(element.parentPackage)
//         }
//     }
// }


function createTree(hierarchy: any, pack: string = null): ItemNode[] {
    return Object.keys(hierarchy).map(path => hierarchy[path].type
        ? new ItemNode(hierarchy[path].fullPath, hierarchy[path].name, null)
        : new ItemNode(pack ? `${pack}.${path}` : path, path, createTree(hierarchy[path], pack ? `${pack}.${path}` : path)))
}

export class DataManageSelectors {


    private static getSourceRootsHash = new Map<number, any>();

    static getSourceRoots(commitIndex: number) {
        if (!this.getSourceRootsHash.has(commitIndex)) {
            this.getSourceRootsHash.set(commitIndex, createSelector([RepositoryState.getCommitElementsImmutable(commitIndex)], (elements) => {
                const roots = new Set<string>();
                Object.keys(elements).forEach(path => elements[path] && roots.add(elements[path].sourceRoot));
                return [...roots];
            }));
        }
        return this.getSourceRootsHash.get(commitIndex);
    }

    private static getFilteredElementsHash = new Map<number, any>();

    static getFilteredElements(commitIndex: number) {
        if (!this.getFilteredElementsHash.has(commitIndex)) {
            this.getFilteredElementsHash.set(commitIndex, createSelector([
                RepositoryState.getCommitElementsImmutable(commitIndex),
                RepositoryState.getRootPath,
                RepositoryState.getSourceRoot], (elements, path: string, sourceRoot: string) => {
                return Object.keys(elements)
                    .filter(path => elements[path] !== null)
                    .filter(path => path.startsWith(path))
                    .filter(path => sourceRoot === '' ? true : elements[path].sourceRoot === sourceRoot)
                    .map(path => elements[path]);
            }));
        }
        return this.getFilteredElementsHash.get(commitIndex);
    }

    private static getHierarchyHash = new Map<number, (elements: any) => Hierarchy>();

    static getHierarchy(commitIndex: number) {
        if (!this.getHierarchyHash.has(commitIndex)) {
            this.getHierarchyHash.set(commitIndex, createSelector(
                [this.getFilteredElements(commitIndex)], elements => createHierarchy(elements))
            );
        }
        return this.getHierarchyHash.get(commitIndex);
    }

    private static getTreeItemsHash = new Map<number, (hierarchy: any) => ItemNode[]>();

    static getTreeItems(commitIndex: number) {
        if (!this.getTreeItemsHash.has(commitIndex)) {
            this.getTreeItemsHash.set(commitIndex, createSelector(
                [this.getHierarchy(commitIndex)], hierarchy => createTree(hierarchy))
            )
        }
        return this.getTreeItemsHash.get(commitIndex);
    }
}