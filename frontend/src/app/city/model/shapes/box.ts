import { Shape } from "./shape";
import * as THREE from 'three';
import { Point } from "./point";

export class Box extends Shape {

    get size(): Point {
        return {
            x: this.length,
            y: this.height,
            z: this.width
        };
    }


    constructor(private length: number, private height: number, private width: number) {
        super();
        this.geometry = new THREE.BoxBufferGeometry(length, height, width);
    }

    protected createHighLightGeometry(): THREE.BufferGeometry {
        return new THREE.BoxBufferGeometry(this.length + 2, this.height + 1, this.width + 2)
            .translate(0, 1, 0)
    }
}