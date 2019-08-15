import { Element } from '../model/element.model';
import * as THREE from 'three';

export abstract class SceneService {
    // readonly canvas: HTMLCanvasElement;
    // resize: (width: number, height: number) => void;
    show: (hierarchy: Element) => THREE.Object3D[];
    // showProject: (hierarchy: HierarchyNode<Element>) => void;
}
