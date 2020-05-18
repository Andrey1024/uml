import { VersionedElement } from "../../versioning/versioned-element.model";
import { MemberElement, TypeElement } from "../server/element";
import { ItemNode } from "../../tree-item.model";
import { map, set } from "lodash-es";

export function createTree(elements: VersionedElement<TypeElement>[], members: VersionedElement<MemberElement>[]): ItemNode[] {
    const packageMap: any = {};
    const packages = new Set<string>(map(elements, e => e.data.parentPackage));
    for (const element of elements) {
        const pathSplits = element.data.fullPath.split('.');
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

    return function createItems(hierarchy: any, pack: string = null, level = 0): ItemNode[] {
        return Object.keys(hierarchy).map(path => {
            if (hierarchy[path].data) {
                const { data } = hierarchy[path];
                return {
                    item: data.fullPath, label: data.name, lifeRatio: data.lifeRatio,
                    children: null, element: hierarchy[path],
                    members: members.filter(m => m.data.parentClass === data.fullPath),
                    level, depth: 0
                };
            } else {
                const children = createItems(hierarchy[path], pack ? `${pack}.${path}` : path, level + 1);
                return {
                    item: pack ? `${pack}.${path}` : path,
                    label: path, lifeRatio: Math.max(...children.map(c => c.lifeRatio)), children, level,
                    depth: Math.max(...children.map(c => c.depth)) + 1
                };
            }

        })
    }(packageMap);
}