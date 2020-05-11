import { Element } from "../server-model/element";
import { Shape } from "../shapes/shape";
import { Group } from "../shapes/group";
import { ItemNode } from "../tree-item.model";
import * as THREE from "three";

export abstract class AbstractVisualizer {

    protected static closeValue(value: number, ...steps: number[]): number {
        let i = 0;
        while (value > steps[i] && steps.length > i + 1) {
            i++;
        }

        return steps[i];
    }

    abstract createElementShape(element: Element, options): Shape;

    abstract createNestedGroup(children: Shape[]): Group;

    abstract createPackageShape(node: ItemNode, children: Group): Shape;

    abstract createRootShape(children: Shape[]): Shape;

    mapIds: Map<string, number>;

    private createPackageGroup(node: ItemNode, children: Shape[]): Shape {
        const group: Group = this.createNestedGroup(children);
        return new Group([
            group,
            node.item === null ? this.createRootShape(children) : this.createPackageShape(node, group)]
        );
    }

    visualize(hierarchy: ItemNode[], options): THREE.Mesh {
        const createElements = (hierarchy: ItemNode): Shape => hierarchy.children === null
            ? this.createElementShape(hierarchy.element, options)
            : this.createPackageGroup(hierarchy, hierarchy.children.map(child => createElements(child)));

        const shape = createElements({ item: null, label: null, children: hierarchy });
        return new THREE.Mesh(shape.finalize(), new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
            vertexColors: true,
            shininess: 0
        }));
    }
}