import { Shape } from "../shapes/shape";
import { ItemNode } from "../tree-item.model";
import * as THREE from "three";
import { Illustrator, IllustratorHelper } from "../illustrators/illustrator";
import { Container } from "../shapes/containers/container";
import { VisualizerOptions } from "../../services/visualizer";


export interface Visualization {
    elementsMesh: THREE.Mesh;
    pickingMesh: THREE.Mesh;
    indicesMap: Map<number, string>;
}

export abstract class AbstractVisualizer<T extends Shape> {
    protected illustratorClass: new () => Illustrator<T>;

    visualize(hierarchy: ItemNode[], options: VisualizerOptions): IllustratorHelper {
        if (!hierarchy.length) {
            return null;
        }
        const illustrator = new this.illustratorClass();
        const createElements = (hierarchy: ItemNode): T => hierarchy.children === null
            ? illustrator.createElementShape(hierarchy, options)
            : illustrator.createPackageShape(hierarchy, hierarchy.children.map(child => createElements(child)));

        illustrator.createRootShape(hierarchy.map(e => createElements(e)));
        return illustrator;
    }
}