import { ItemNode } from "../tree-item.model";
import { Element } from "../presentation/server/element";
import { Shape } from "../shapes/shape";
import * as THREE from "three";
import { Container } from "../shapes/containers/container";
import { VersionedElement } from "../versioning/versioned-element.model";
import { MethodModel } from "../presentation/server/method.model";
import { VisualizerOptions } from "../../services/visualizer";

export interface IllustratorHelper {
    getTreeMesh(): THREE.Mesh;

    getNameByIndex(index: number): string;

    getPickingMesh(): THREE.Mesh;

    createHighLightMesh(index: string, color: string): THREE.Mesh;
}

export abstract class Illustrator implements IllustratorHelper {

    public abstract createPackageShape(node: ItemNode, children: Container): Shape;

    public abstract createElementShape(node: ItemNode, options: VisualizerOptions): Shape;

    public abstract createRootShape(children: Container): Shape;

    public abstract getTreeMesh(): THREE.Mesh;

    public abstract getPickingMesh(): THREE.Mesh;

    public abstract getNameByIndex(index: number): string;

    public abstract createHighLightMesh(index: string, color: string): THREE.Mesh;
}
