import { Element } from '../model/element.model';
import * as THREE from 'three';

export abstract class LayoutService {
    place: (hierarchy: Element) => THREE.Object3D[];
}
