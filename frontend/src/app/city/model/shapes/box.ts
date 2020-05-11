import { Shape } from "./shape";
import * as THREE from 'three';

export class Box extends Shape {
    constructor(private width: number, private height: number, private length: number) {
        super();
        this.geometry = new THREE.BoxBufferGeometry(width, height, length);
    }

    getDimensions(): { x: number; y: number; z: number } {
        return { x: this.width, y: this.height, z: this.length };
    }
}