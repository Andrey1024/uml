import * as THREE from 'three';
import { Hierarchy } from "../model/hierarchy.model";

export interface DisplayOptions {
    showAuthors: boolean;
    selectedAuthors: string[];
}

export abstract class LayoutService {
    name: string;
    place: (hierarchy: Hierarchy, options: DisplayOptions) => THREE.Object3D[];
}
