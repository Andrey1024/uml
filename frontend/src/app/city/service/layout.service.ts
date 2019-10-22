import { Element } from '../model/element.model';
import * as THREE from 'three';

export abstract class LayoutService {
    name: string;
    place: (hierarchy: Element) => THREE.Object3D[];
}
