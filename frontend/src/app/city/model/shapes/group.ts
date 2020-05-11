import { Shape } from "./shape";
import * as THREE from 'three';

export class Group extends Shape {
    constructor(protected children: Shape[]) {
        super();
    }

    finalize(): THREE.BufferGeometry {
        this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.finalize()));
        return super.finalize();
    }

    public getPickGeometry(index: number): THREE.BufferGeometry {
        return THREE.BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.getPickGeometry(0)));;
    }
}