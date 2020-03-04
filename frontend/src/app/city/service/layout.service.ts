import * as THREE from 'three';
import { Hierarchy } from "../model/hierarchy.model";

export abstract class LayoutService {
    name: string;
    place: (hierarchy: Hierarchy) => THREE.Object3D[];
}
