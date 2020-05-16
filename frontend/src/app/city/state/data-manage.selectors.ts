import { createSelector } from "@ngxs/store";
import { map, mapValues, set } from "lodash-es";
import { RepositoryState } from "./repository.state";
import { Hierarchy } from "../model/hierarchy.model";
import { Element } from "../model/presentation/server/element";
import { ItemNode } from "../model/tree-item.model";
import { createCachedSelector } from "../utils/cached-selector";

function createHierarchy(elements: Element[]): Hierarchy {
    let packageMap: Hierarchy = {};
    const packages = new Set<string>(map(elements, 'parentPackage'));
    for (const element of elements) {
        const pathSplits = element.fullPath.split('.');
        const path = [];
        let i = 1;
        while (pathSplits.length > 0) {
            if (packages.has(pathSplits.slice(0, -i).join('.')) || i++ === pathSplits.length) {
                path.unshift(pathSplits.splice(-i, i).join('.'));
                i = 1;
            }
        }
        set(packageMap, path, element);
    }

    return packageMap;
}


function createTree(hierarchy: any, pack: string = null, level = 0): ItemNode[] {
    return Object.keys(hierarchy).map(path => {
        if (hierarchy[path].type) {
            return {
                item: hierarchy[path].fullPath,
                label: hierarchy[path].name,
                lifeRatio: hierarchy[path].lifeRatio,
                children: null,
                element: hierarchy[path],
                level, depth: 0
            };
        } else {
            const children = createTree(hierarchy[path], pack ? `${pack}.${path}` : path, level + 1);
            return {
                item: pack ? `${pack}.${path}` : path,
                label: path, lifeRatio: Math.max(...children.map(c => c.lifeRatio)), children, level,
                depth: Math.max(...children.map(c => c.depth)) + 1
            };
        }

    })
}

export class DataManageSelectors {

    static getFilteredElements(commitIndex: number) {
        return createCachedSelector('getFilteredElements', createSelector([
            RepositoryState.getCommitElementsImmutable(commitIndex),
            RepositoryState.getSourceRoot], (elements, sourceRoot: string) => {
            return Object.keys(elements)
                .filter(path => elements[path] !== null)
                .filter(path => sourceRoot === '' ? true : elements[path].sourceRoot === sourceRoot)
                .map(path => elements[path]);
        }), commitIndex);
    }

    static getHierarchy(commitIndex: number) {
        return createCachedSelector('getHierarchy', createSelector(
            [this.getFilteredElements(commitIndex)], elements => createHierarchy(elements)), commitIndex
        );

    }

    static getHierarchySlice(commitIndex: number): (h, p) => Hierarchy {
        return createCachedSelector('getHierarchySlice', createSelector(
            [this.getHierarchy(commitIndex), RepositoryState.getRootPath], (hierarchy, path: string) => {
                if (path === '') {
                    return hierarchy;
                }
                let result = hierarchy;
                const pathElements = path.split('.');
                let pathName = pathElements.shift();
                while (pathElements.length > 0) {
                    if (result[pathName]) {
                        result = result[pathName];
                        if (pathElements.length > 0) {
                            pathName = pathElements.shift();
                        }
                    } else {
                        pathName += '.' + pathElements.shift();
                    }
                }
                return { [path]: result[pathName] };
            }), commitIndex
        );

    }

    static getTreeItems(commitIndex: number): (e) => ItemNode[] {
        return createCachedSelector('getTreeItems', createSelector(
            [this.getHierarchySlice(commitIndex)], hierarchy => createTree(hierarchy)), commitIndex
        )
    }
}