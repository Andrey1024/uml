import * as THREE from 'three';
import { Hierarchy } from "../model/hierarchy.model";

export abstract class LayoutService {
    name: string;
    place: (hierarchy: Hierarchy, options: any) => THREE.Object3D[];
}
